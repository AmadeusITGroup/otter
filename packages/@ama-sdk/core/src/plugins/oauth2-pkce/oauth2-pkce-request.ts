import {
  PluginRunner,
  RequestOptions,
  RequestPlugin,
  RequestPluginContext,
} from '../core';
import {
  generateCodeChallenge,
  generateCodeVerifier,
  generateRandomString,
} from './oauth2-pkce-helpers';
import {
  InMemoryStorage,
  OAuth2Storage,
  OAuth2Token,
} from './oauth2-pkce-storage';

/**
 * Pending authorization transaction kept during the redirection to the Authorization Server
 */
export interface OAuth2PkceTransaction {
  /** Opaque value used to prevent CSRF attacks */
  state: string;
  /** PKCE code verifier */
  codeVerifier: string;
  /** Application state to restore after the redirection */
  appState?: string;
}

/**
 * Options of the {@link OAuth2PkceRequest} plugin
 */
export interface OAuth2PkceRequestOptions {
  /** Client ID of the application registered on the Authorization Server */
  clientId: string;
  /** URL of the authorization endpoint of the Authorization Server */
  authorizationEndpoint: string;
  /** URL of the token endpoint of the Authorization Server */
  tokenEndpoint: string;
  /** URL of the application to which the Authorization Server redirects after the authentication */
  redirectUri: string;
  /** Scope requested for the access token (space separated) */
  scope?: string;
  /** Additional parameters sent to the authorization endpoint (e.g. `audience`, `prompt`) */
  additionalAuthorizationParameters?: Record<string, string>;
  /**
   * Storage of the token set (standard Web Storage such as `sessionStorage`, or its asynchronous equivalent).
   * Warning: in a browser, persistent storages increase the surface of XSS attacks to steal the token.
   * @default new InMemoryStorage()
   */
  tokenStorage?: OAuth2Storage;
  /**
   * Key used to store the token set
   * @default 'ama-sdk-oauth2-token'
   */
  tokenStorageKey?: string;
  /**
   * Storage of the pending authorization transaction, it has to survive the redirection to the Authorization Server.
   * @default globalThis.sessionStorage (available in browsers and NodeJS >= 25, or NodeJS >= 22.4 with the `--experimental-webstorage` flag)
   */
  transactionStorage?: OAuth2Storage;
  /**
   * Key used to store the pending authorization transaction
   * @default 'ama-sdk-oauth2-pkce-transaction'
   */
  transactionStorageKey?: string;
  /**
   * Margin (in seconds) applied to the token expiration time to consider it expired before it actually is
   * @default 30
   */
  expirationMarginInSec?: number;
  /**
   * Header in which the access token is sent
   * @default 'Authorization'
   */
  headerName?: string;
  /**
   * Function called when no valid access token is available to process a request.
   * If a valid token is available once the returned promise is resolved, the request continues, otherwise it is rejected.
   * @default plugin.login() (redirection to the Authorization Server)
   */
  onLoginRequired?: (plugin: OAuth2PkceRequest) => void | Promise<void>;
  /**
   * Function used to navigate to the Authorization Server
   * @default (url) => window.location.assign(url)
   */
  navigate?: (url: string) => void | Promise<void>;
  /**
   * Function used to send the requests to the token endpoint (authorization code exchange and token refresh).
   * The `basePath` of the request options is the token endpoint URL.
   * It can be overridden to customize the token requests, for example to apply SDK request plugins such as `BotProtectionFingerprintRequest`.
   * The response is parsed by the plugin as defined in {@link https://datatracker.ietf.org/doc/html/rfc6749#section-5|RFC 6749 §5}.
   * @default (requestOptions) => fetch(requestOptions.basePath, requestOptions)
   * @example Add the bot protection fingerprint to the token requests
   * ```typescript
   * const botProtection = new BotProtectionFingerprintRequest({ ... });
   * const botProtectionRunner = botProtection.load();
   * const oauth2Plugin = new OAuth2PkceRequest({
   *   ...,
   *   requestToken: async (requestOptions) => {
   *     const options = await botProtectionRunner.transform(requestOptions);
   *     return fetch(options.basePath, options);
   *   }
   * });
   * ```
   */
  requestToken?: (requestOptions: RequestOptions) => Promise<Response>;
}

/**
 * Default function used to send the requests to the token endpoint
 * @param requestOptions Options of the token request
 */
const defaultRequestToken = (requestOptions: RequestOptions) => fetch(requestOptions.basePath, requestOptions);

/**
 * Error raised by the OAuth 2.0 Authorization Code + PKCE flow
 */
export class OAuth2PkceError extends Error {
  /**
   * Error raised by the OAuth 2.0 Authorization Code + PKCE flow
   * @param message Error message
   * @param error OAuth 2.0 error code
   * @param errorDescription OAuth 2.0 error description
   */
  constructor(message: string, public readonly error?: string, public readonly errorDescription?: string) {
    super(message);
    this.name = 'OAuth2PkceError';
  }
}

/* eslint-disable @typescript-eslint/naming-convention -- naming convention imposed by OAuth 2.0 specification */
/**
 * Raw token response of the Authorization Server
 * ({@link https://datatracker.ietf.org/doc/html/rfc6749#section-5.1|RFC 6749 §5.1} and {@link https://datatracker.ietf.org/doc/html/rfc6749#section-5.2|§5.2})
 */
interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  id_token?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}
/* eslint-enable @typescript-eslint/naming-convention */

/**
 * Plugin to authenticate the calls to an API Gateway (micro-gateway) directly from the browser, without BFF,
 * using the OAuth 2.0 Authorization Code flow with PKCE.
 * The access token is sent as Bearer in the Authorization header of each request.
 */
export class OAuth2PkceRequest implements RequestPlugin {
  private readonly tokenStorage: OAuth2Storage;
  private readonly tokenStorageKey: string;
  private readonly transactionStorageKey: string;
  private readonly expirationMarginInMs: number;
  private readonly headerName: string;
  private pendingRefresh?: Promise<OAuth2Token | undefined>;

  /**
   * Initialize the plugin
   * @param options Options of the plugin
   */
  constructor(private readonly options: OAuth2PkceRequestOptions) {
    this.tokenStorage = options.tokenStorage ?? new InMemoryStorage();
    this.tokenStorageKey = options.tokenStorageKey ?? 'ama-sdk-oauth2-token';
    this.transactionStorageKey = options.transactionStorageKey ?? 'ama-sdk-oauth2-pkce-transaction';
    this.expirationMarginInMs = (options.expirationMarginInSec ?? 30) * 1000;
    this.headerName = options.headerName ?? 'Authorization';
  }

  private async readToken(): Promise<OAuth2Token | undefined> {
    const value = await this.tokenStorage.getItem(this.tokenStorageKey);
    if (!value) {
      return undefined;
    }
    try {
      return JSON.parse(value) as OAuth2Token;
    } catch {
      await this.clearToken();
      return undefined;
    }
  }

  private async writeToken(token: OAuth2Token) {
    await this.tokenStorage.setItem(this.tokenStorageKey, JSON.stringify(token));
  }

  private async clearToken() {
    await this.tokenStorage.removeItem(this.tokenStorageKey);
  }

  private get transactionStorage(): OAuth2Storage {
    if (this.options.transactionStorage) {
      return this.options.transactionStorage;
    }
    if (typeof globalThis.sessionStorage === 'undefined') {
      throw new OAuth2PkceError('No transaction storage available, please provide the `transactionStorage` option');
    }
    return globalThis.sessionStorage;
  }

  private getCurrentUrl() {
    if (typeof window === 'undefined') {
      throw new OAuth2PkceError('The URL has to be provided outside of a browser context');
    }
    return window.location.href;
  }

  private isTokenValid(token: OAuth2Token) {
    return token.expiresAt === undefined || token.expiresAt - this.expirationMarginInMs > Date.now();
  }

  private async exchangeToken(parameters: Record<string, string>, previousToken?: OAuth2Token): Promise<OAuth2Token> {
    const response = await (this.options.requestToken ?? defaultRequestToken)({
      basePath: this.options.tokenEndpoint,
      method: 'POST',
      headers: new Headers({ 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' }),
      body: new URLSearchParams({ client_id: this.options.clientId, ...parameters }).toString()
    });
    const tokenResponse = await (response.json() as Promise<Partial<TokenResponse>>).catch((): Partial<TokenResponse> => ({}));
    if (!response.ok || !tokenResponse.access_token) {
      throw new OAuth2PkceError(`Token request failed with status ${response.status}`, tokenResponse.error, tokenResponse.error_description);
    }
    const token: OAuth2Token = {
      accessToken: tokenResponse.access_token,
      tokenType: tokenResponse.token_type || 'Bearer',
      expiresAt: typeof tokenResponse.expires_in === 'number' ? Date.now() + tokenResponse.expires_in * 1000 : undefined,
      // keep the previous refresh token if the Authorization Server does not rotate it
      refreshToken: tokenResponse.refresh_token ?? previousToken?.refreshToken,
      idToken: tokenResponse.id_token ?? previousToken?.idToken,
      scope: tokenResponse.scope ?? previousToken?.scope
    };
    await this.writeToken(token);
    return token;
  }

  private refreshToken(token: OAuth2Token & { refreshToken: string }) {
    this.pendingRefresh ||= this.exchangeToken({ grant_type: 'refresh_token', refresh_token: token.refreshToken }, token)
      .catch(async () => {
        await this.clearToken();
        return undefined;
      })
      .finally(() => this.pendingRefresh = undefined);
    return this.pendingRefresh;
  }

  /**
   * Redirect the user to the Authorization Server to start the Authorization Code + PKCE flow
   * @param options Options of the authorization request
   * @param options.appState Application state to retrieve once redirected back to the application
   * @param options.additionalParameters Additional parameters sent to the authorization endpoint
   */
  public async login(options?: { appState?: string; additionalParameters?: Record<string, string> }) {
    const transaction: OAuth2PkceTransaction = {
      state: generateRandomString(32),
      codeVerifier: generateCodeVerifier(),
      appState: options?.appState
    };
    await this.transactionStorage.setItem(this.transactionStorageKey, JSON.stringify(transaction));
    const url = new URL(this.options.authorizationEndpoint);
    const parameters = {
      ...this.options.additionalAuthorizationParameters,
      ...options?.additionalParameters,
      response_type: 'code',
      client_id: this.options.clientId,
      redirect_uri: this.options.redirectUri,
      ...(this.options.scope ? { scope: this.options.scope } : {}),
      state: transaction.state,
      code_challenge: await generateCodeChallenge(transaction.codeVerifier),
      code_challenge_method: 'S256'
    };
    Object.entries(parameters).forEach(([key, value]) => url.searchParams.set(key, value));
    await (this.options.navigate ? this.options.navigate(url.toString()) : window.location.assign(url.toString()));
  }

  /**
   * Determine if the given URL is a redirection from the Authorization Server
   * @param url URL to check (default to the current URL)
   */
  public isRedirectCallback(url = this.getCurrentUrl()) {
    const { searchParams } = new URL(url);
    return searchParams.has('state') && (searchParams.has('code') || searchParams.has('error'));
  }

  /**
   * Handle the redirection from the Authorization Server: exchange the authorization code for a token set
   * @param url URL of the redirection (default to the current URL)
   * @returns the application state provided to {@link login}
   */
  public async handleRedirectCallback(url = this.getCurrentUrl()): Promise<{ appState?: string }> {
    const { searchParams } = new URL(url);
    const storedTransaction = await this.transactionStorage.getItem(this.transactionStorageKey);
    await this.transactionStorage.removeItem(this.transactionStorageKey);
    const error = searchParams.get('error');
    if (error) {
      throw new OAuth2PkceError(`Authorization request failed: ${error}`, error, searchParams.get('error_description') ?? undefined);
    }
    const code = searchParams.get('code');
    if (!code) {
      throw new OAuth2PkceError('No authorization code found in the URL');
    }
    if (!storedTransaction) {
      throw new OAuth2PkceError('No pending authorization transaction found');
    }
    const transaction = JSON.parse(storedTransaction) as OAuth2PkceTransaction;
    if (transaction.state !== searchParams.get('state')) {
      throw new OAuth2PkceError('Invalid state returned by the Authorization Server');
    }
    await this.exchangeToken({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.options.redirectUri,
      code_verifier: transaction.codeVerifier
    });
    return { appState: transaction.appState };
  }

  /**
   * Retrieve a valid token set, refreshing it if expired and a refresh token is available
   * @returns the token set or `undefined` if no valid token is available
   */
  public async getToken(): Promise<OAuth2Token | undefined> {
    const token = await this.readToken();
    if (!token) {
      return undefined;
    }
    if (this.isTokenValid(token)) {
      return token;
    }
    if (token.refreshToken) {
      return this.refreshToken({ ...token, refreshToken: token.refreshToken });
    }
    await this.clearToken();
    return undefined;
  }

  /**
   * Retrieve the value of the authorization header
   * @returns the authorization header value or `undefined` if no valid token is available
   */
  public async getAuthorizationHeaderValue(): Promise<string | undefined> {
    const token = await this.getToken();
    if (!token) {
      return undefined;
    }
    const tokenType = token.tokenType.toLowerCase() === 'bearer' ? 'Bearer' : token.tokenType;
    return `${tokenType} ${token.accessToken}`;
  }

  /**
   * Invalidate the current access token (for example when rejected by the API Gateway).
   * The refresh token, if any, is kept to renew the access token on the next call.
   */
  public async invalidateAccessToken() {
    const token = await this.readToken();
    await (token?.refreshToken ? this.writeToken({ ...token, expiresAt: 0 }) : this.clearToken());
  }

  /** Remove the token set and the pending authorization transaction */
  public async logout() {
    await this.transactionStorage.removeItem(this.transactionStorageKey);
    await this.clearToken();
  }

  /**
   * Set the authorization header on the request
   * @param data Request options
   */
  public async setAuthorizationHeader(data: RequestOptions) {
    let authorization = await this.getAuthorizationHeaderValue();
    if (!authorization) {
      await (this.options.onLoginRequired ? this.options.onLoginRequired(this) : this.login());
      authorization = await this.getAuthorizationHeaderValue();
    }
    if (!authorization) {
      throw new OAuth2PkceError('Authentication required to process the request');
    }
    data.headers.set(this.headerName, authorization);
    return data;
  }

  /** @inheritdoc */
  public load(_context?: RequestPluginContext): PluginRunner<RequestOptions, RequestOptions> {
    return {
      transform: (data: RequestOptions) => this.setAuthorizationHeader(data)
    };
  }
}
