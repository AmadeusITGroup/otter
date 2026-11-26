import {
  createHash,
} from 'node:crypto';
import {
  runInThisContext,
} from 'node:vm';
import {
  BotProtectionFingerprintRequest,
} from '../bot-protection-fingerprint';
import type {
  RequestOptions,
} from '../core';
import {
  generateCodeChallenge,
  generateCodeVerifier,
  generateRandomString,
} from './oauth2-pkce-helpers';
import {
  OAuth2PkceError,
  OAuth2PkceRequest,
  OAuth2PkceRequestOptions,
} from './oauth2-pkce-request';
import {
  InMemoryStorage,
  OAuth2AsyncStorage,
  OAuth2SyncStorage,
  OAuth2Token,
} from './oauth2-pkce-storage';

/**
 * Web Storage API of NodeJS (retrieved from the main context as the Jest sandbox does not expose it).
 * Falls back to an in-memory storage when the NodeJS version in use does not provide the Web Storage API by default.
 */
const nodeSessionStorage = (runInThisContext('typeof sessionStorage !== "undefined" ? sessionStorage : undefined') as Storage | undefined) ?? new InMemoryStorage();

const TOKEN_KEY = 'ama-sdk-oauth2-token';
const TRANSACTION_KEY = 'ama-sdk-oauth2-pkce-transaction';

const storeToken = (storage: OAuth2SyncStorage, token: OAuth2Token) => storage.setItem(TOKEN_KEY, JSON.stringify(token));
const readStoredToken = (storage: OAuth2SyncStorage): OAuth2Token | null => JSON.parse(storage.getItem(TOKEN_KEY) ?? 'null');
const toAsyncStorage = (storage: OAuth2SyncStorage): OAuth2AsyncStorage => ({
  getItem: (key) => Promise.resolve(storage.getItem(key)),
  setItem: (key, value) => Promise.resolve(storage.setItem(key, value)),
  removeItem: (key) => Promise.resolve(storage.removeItem(key))
});

const tokenResponse = (body: any, status = 200) => ({ ok: status < 400, status, json: () => Promise.resolve(body) }) as Response;

describe('OAuth2 PKCE helpers', () => {
  it('should generate a random string of unreserved characters', () => {
    const value = generateRandomString(100);

    expect(value).toHaveLength(100);
    expect(value).toMatch(/^[\w.~-]+$/);
    expect(generateRandomString(100)).not.toBe(value);
  });

  it('should reject invalid code verifier length', () => {
    expect(() => generateCodeVerifier(42)).toThrow();
    expect(() => generateCodeVerifier(129)).toThrow();
    expect(generateCodeVerifier()).toHaveLength(64);
  });

  it('should generate the S256 code challenge', async () => {
    const verifier = generateCodeVerifier();

    await expect(generateCodeChallenge(verifier)).resolves.toBe(createHash('sha256').update(verifier).digest('base64url'));
  });
});

describe('OAuth2 PKCE in-memory storage', () => {
  it('should behave as the standard Web Storage API', () => {
    const storage = new InMemoryStorage();
    storage.setItem('a', '1');
    storage.setItem('b', '2');

    expect(storage.length).toBe(2);
    expect(storage.key(1)).toBe('b');
    expect(storage.key(2)).toBeNull();
    expect(storage.getItem('a')).toBe('1');
    expect(storage.getItem('unknown')).toBeNull();

    storage.removeItem('a');

    expect(storage.getItem('a')).toBeNull();

    storage.clear();

    expect(storage.length).toBe(0);
  });

  it('should behave as the NodeJS Web Storage API', () => {
    const storage = new InMemoryStorage();
    for (const webStorage of [storage, nodeSessionStorage]) {
      webStorage.setItem('compat-key', 'value');
    }

    expect(storage.getItem('compat-key')).toBe(nodeSessionStorage.getItem('compat-key'));
    expect(storage.getItem('unknown')).toBe(nodeSessionStorage.getItem('unknown'));

    nodeSessionStorage.removeItem('compat-key');
  });
});

describe('OAuth2 PKCE request plugin', () => {
  let transactionStorage: InMemoryStorage;
  let navigate: jest.Mock;
  let fetchMock: jest.SpyInstance;
  let options: OAuth2PkceRequestOptions;
  let requestOptions: RequestOptions;

  const loginAndGetCallbackUrl = async (plugin: OAuth2PkceRequest, appState?: string) => {
    await plugin.login({ appState });
    const state = new URL(navigate.mock.calls[0][0]).searchParams.get('state');
    return `https://app.test.com/callback?code=auth-code&state=${state}`;
  };

  beforeEach(() => {
    jest.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    transactionStorage = new InMemoryStorage();
    navigate = jest.fn();
    fetchMock = jest.spyOn(globalThis, 'fetch');
    options = {
      clientId: 'my-client',
      authorizationEndpoint: 'https://idp.test.com/authorize',
      tokenEndpoint: 'https://idp.test.com/token',
      redirectUri: 'https://app.test.com/callback',
      scope: 'openid profile',
      additionalAuthorizationParameters: { audience: 'mgw' },
      transactionStorage,
      navigate
    };
    requestOptions = { headers: new Headers(), basePath: 'https://mgw.test.com/api', method: 'GET' };
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  it('should redirect to the authorization endpoint with the PKCE parameters', async () => {
    const plugin = new OAuth2PkceRequest(options);
    await plugin.login({ appState: '/my-page' });

    expect(navigate).toHaveBeenCalledTimes(1);

    const url = new URL(navigate.mock.calls[0][0]);
    const transaction = JSON.parse(transactionStorage.getItem(TRANSACTION_KEY));

    expect(url.origin + url.pathname).toBe(options.authorizationEndpoint);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      response_type: 'code',
      client_id: 'my-client',
      redirect_uri: 'https://app.test.com/callback',
      scope: 'openid profile',
      audience: 'mgw',
      state: transaction.state,
      code_challenge: await generateCodeChallenge(transaction.codeVerifier),
      code_challenge_method: 'S256'
    });
    expect(transaction.appState).toBe('/my-page');
  });

  it('should exchange the authorization code for a token', async () => {
    const plugin = new OAuth2PkceRequest(options);
    const callbackUrl = await loginAndGetCallbackUrl(plugin, '/my-page');
    const { codeVerifier } = JSON.parse(transactionStorage.getItem(TRANSACTION_KEY));
    fetchMock.mockResolvedValue(tokenResponse({ access_token: 'access', token_type: 'bearer', expires_in: 3600, refresh_token: 'refresh' }));

    expect(plugin.isRedirectCallback(callbackUrl)).toBe(true);
    await expect(plugin.handleRedirectCallback(callbackUrl)).resolves.toEqual({ appState: '/my-page' });

    const [url, init] = fetchMock.mock.calls[0];

    expect(url).toBe(options.tokenEndpoint);
    expect(init.method).toBe('POST');
    expect(Object.fromEntries(new URLSearchParams(init.body))).toEqual({
      client_id: 'my-client',
      grant_type: 'authorization_code',
      code: 'auth-code',
      redirect_uri: options.redirectUri,
      code_verifier: codeVerifier
    });
    expect(transactionStorage.length).toBe(0);
    await expect(plugin.getToken()).resolves.toEqual(expect.objectContaining({
      accessToken: 'access',
      refreshToken: 'refresh',
      expiresAt: Date.now() + 3_600_000
    }));
  });

  it('should support an asynchronous transaction storage and the NodeJS sessionStorage as token storage', async () => {
    const plugin = new OAuth2PkceRequest({
      ...options,
      transactionStorage: toAsyncStorage(transactionStorage),
      tokenStorage: nodeSessionStorage,
      tokenStorageKey: 'node-test'
    });
    const callbackUrl = await loginAndGetCallbackUrl(plugin, '/my-page');
    fetchMock.mockResolvedValue(tokenResponse({ access_token: 'access', token_type: 'Bearer' }));

    await expect(plugin.handleRedirectCallback(callbackUrl)).resolves.toEqual({ appState: '/my-page' });
    expect(transactionStorage.length).toBe(0);
    expect(JSON.parse(nodeSessionStorage.getItem('node-test'))).toEqual({ accessToken: 'access', tokenType: 'Bearer' });
    await expect(plugin.getAuthorizationHeaderValue()).resolves.toBe('Bearer access');

    await plugin.logout();

    expect(nodeSessionStorage.getItem('node-test')).toBeNull();
  });

  it('should support an asynchronous token storage', async () => {
    const tokenStorage = new InMemoryStorage();
    storeToken(tokenStorage, { accessToken: 'access', tokenType: 'Bearer' });
    const plugin = new OAuth2PkceRequest({ ...options, tokenStorage: toAsyncStorage(tokenStorage) });

    await expect(plugin.getAuthorizationHeaderValue()).resolves.toBe('Bearer access');

    await plugin.logout();

    expect(tokenStorage.length).toBe(0);
  });

  it('should clear an invalid stored token', async () => {
    const tokenStorage = new InMemoryStorage();
    tokenStorage.setItem(TOKEN_KEY, 'invalid json');
    const plugin = new OAuth2PkceRequest({ ...options, tokenStorage });

    await expect(plugin.getToken()).resolves.toBeUndefined();
    expect(tokenStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it('should reject the callback with an invalid state', async () => {
    const plugin = new OAuth2PkceRequest(options);
    await plugin.login();

    await expect(plugin.handleRedirectCallback('https://app.test.com/callback?code=auth-code&state=wrong')).rejects.toThrow(OAuth2PkceError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should reject the callback with an error returned by the Authorization Server', async () => {
    const plugin = new OAuth2PkceRequest(options);

    await expect(plugin.handleRedirectCallback('https://app.test.com/callback?error=access_denied&state=s'))
      .rejects.toEqual(expect.objectContaining({ error: 'access_denied' }));
  });

  it('should add the access token to the request', async () => {
    const plugin = new OAuth2PkceRequest({ ...options, tokenStorage: new InMemoryStorage() });
    const callbackUrl = await loginAndGetCallbackUrl(plugin);
    fetchMock.mockResolvedValue(tokenResponse({ access_token: 'access', token_type: 'bearer', expires_in: 3600 }));
    await plugin.handleRedirectCallback(callbackUrl);

    const result = await plugin.load().transform(requestOptions);

    expect(result.headers.get('Authorization')).toBe('Bearer access');
  });

  it('should refresh the expired access token once for concurrent requests', async () => {
    const plugin = new OAuth2PkceRequest(options);
    const callbackUrl = await loginAndGetCallbackUrl(plugin);
    fetchMock.mockResolvedValueOnce(tokenResponse({ access_token: 'access', token_type: 'Bearer', expires_in: 60, refresh_token: 'refresh' }));
    await plugin.handleRedirectCallback(callbackUrl);
    jest.advanceTimersByTime(31_000);
    fetchMock.mockResolvedValueOnce(tokenResponse({ access_token: 'new-access', token_type: 'Bearer', expires_in: 60 }));

    const [header1, header2] = await Promise.all([plugin.getAuthorizationHeaderValue(), plugin.getAuthorizationHeaderValue()]);

    expect(header1).toBe('Bearer new-access');
    expect(header2).toBe('Bearer new-access');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(Object.fromEntries(new URLSearchParams(fetchMock.mock.calls[1][1].body))).toEqual({
      client_id: 'my-client',
      grant_type: 'refresh_token',
      refresh_token: 'refresh'
    });
    await expect(plugin.getToken()).resolves.toEqual(expect.objectContaining({ refreshToken: 'refresh' }));
  });

  it('should clear the token when the refresh fails', async () => {
    const tokenStorage = new InMemoryStorage();
    storeToken(tokenStorage, { accessToken: 'access', tokenType: 'Bearer', expiresAt: 0, refreshToken: 'refresh' });
    const plugin = new OAuth2PkceRequest({ ...options, tokenStorage });
    fetchMock.mockResolvedValue(tokenResponse({ error: 'invalid_grant' }, 400));

    await expect(plugin.getToken()).resolves.toBeUndefined();
    expect(readStoredToken(tokenStorage)).toBeNull();
  });

  it('should redirect to the login and reject the request when no token is available', async () => {
    const plugin = new OAuth2PkceRequest(options);

    await expect(plugin.load().transform(requestOptions)).rejects.toThrow(OAuth2PkceError);
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(requestOptions.headers.has('Authorization')).toBe(false);
  });

  it('should use the custom login handler when no token is available', async () => {
    const tokenStorage = new InMemoryStorage();
    const onLoginRequired = jest.fn(() => storeToken(tokenStorage, { accessToken: 'access', tokenType: 'Bearer' }));
    const plugin = new OAuth2PkceRequest({ ...options, tokenStorage, onLoginRequired, headerName: 'X-Auth' });

    const result = await plugin.load().transform(requestOptions);

    expect(onLoginRequired).toHaveBeenCalledWith(plugin);
    expect(navigate).not.toHaveBeenCalled();
    expect(result.headers.get('X-Auth')).toBe('Bearer access');
  });

  it('should invalidate the access token but keep the refresh token', async () => {
    const tokenStorage = new InMemoryStorage();
    storeToken(tokenStorage, { accessToken: 'access', tokenType: 'Bearer', refreshToken: 'refresh' });
    const plugin = new OAuth2PkceRequest({ ...options, tokenStorage });

    await plugin.invalidateAccessToken();

    expect(readStoredToken(tokenStorage)).toEqual(expect.objectContaining({ expiresAt: 0, refreshToken: 'refresh' }));

    await plugin.logout();

    expect(readStoredToken(tokenStorage)).toBeNull();
  });

  it('should use the custom token requester with the bot protection plugin', async () => {
    const botProtectionRunner = new BotProtectionFingerprintRequest({
      destinationHeaderName: 'X-D-Token',
      fingerprintRetriever: () => 'fingerprint'
    }).load();
    const requestToken = jest.fn(async (tokenRequestOptions: RequestOptions) => fetch(tokenRequestOptions.basePath, await botProtectionRunner.transform(tokenRequestOptions)));
    const plugin = new OAuth2PkceRequest({ ...options, requestToken });
    const callbackUrl = await loginAndGetCallbackUrl(plugin);
    fetchMock.mockResolvedValueOnce(tokenResponse({ access_token: 'access', token_type: 'Bearer', expires_in: 60, refresh_token: 'refresh' }));
    await plugin.handleRedirectCallback(callbackUrl);
    jest.advanceTimersByTime(31_000);
    fetchMock.mockResolvedValueOnce(tokenResponse({ access_token: 'new-access', token_type: 'Bearer', expires_in: 60 }));

    await expect(plugin.getAuthorizationHeaderValue()).resolves.toBe('Bearer new-access');
    expect(requestToken).toHaveBeenCalledTimes(2);
    expect(requestToken).toHaveBeenCalledWith(expect.objectContaining({ basePath: options.tokenEndpoint, method: 'POST' }));

    for (const [url, init] of fetchMock.mock.calls) {
      expect(url).toBe(options.tokenEndpoint);
      expect(init.headers.get('X-D-Token')).toBe('fingerprint');
      expect(init.headers.get('Content-Type')).toBe('application/x-www-form-urlencoded');
    }
    expect(Object.fromEntries(new URLSearchParams(fetchMock.mock.calls[0][1].body))).toEqual(expect.objectContaining({ grant_type: 'authorization_code' }));
    expect(Object.fromEntries(new URLSearchParams(fetchMock.mock.calls[1][1].body))).toEqual(expect.objectContaining({ grant_type: 'refresh_token' }));
  });

  it('should reject the token exchange when the custom token requester fails', async () => {
    const plugin = new OAuth2PkceRequest({ ...options, requestToken: () => Promise.resolve(tokenResponse({ error: 'access_denied' }, 403)) });
    const callbackUrl = await loginAndGetCallbackUrl(plugin);

    await expect(plugin.handleRedirectCallback(callbackUrl)).rejects.toEqual(expect.objectContaining({ error: 'access_denied' }));
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
