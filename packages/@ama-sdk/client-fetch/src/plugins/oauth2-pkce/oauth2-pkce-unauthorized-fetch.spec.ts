import {
  OAuth2PkceUnauthorizedFetch,
} from './oauth2-pkce-unauthorized-fetch';

describe('OAuth2 PKCE Unauthorized Fetch Plugin', () => {
  let fetchMock: jest.SpyInstance;
  let tokenRenewer: { invalidateAccessToken: jest.Mock; getAuthorizationHeaderValue: jest.Mock };

  beforeEach(() => {
    fetchMock = jest.spyOn(globalThis, 'fetch');
    tokenRenewer = {
      invalidateAccessToken: jest.fn().mockResolvedValue(undefined),
      getAuthorizationHeaderValue: jest.fn().mockResolvedValue('Bearer new-access')
    };
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  it('should not replay a successful call', async () => {
    const plugin = new OAuth2PkceUnauthorizedFetch(tokenRenewer);
    const runner = plugin.load({ url: 'https://mgw.test.com', options: {}, fetchPlugins: [] } as any);
    const response = { ok: true, status: 200 };

    await expect(runner.transform(Promise.resolve(response as Response))).resolves.toBe(response);
    expect(tokenRenewer.invalidateAccessToken).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should renew the token and replay the call once on 401', async () => {
    const plugin = new OAuth2PkceUnauthorizedFetch(tokenRenewer);
    const runners: any[] = [];
    const options = { headers: new Headers({ Authorization: 'Bearer old-access', 'X-Other': 'value' }) };
    const runner = plugin.load({ url: 'https://mgw.test.com', options, fetchPlugins: runners } as any);
    runners.push(runner);
    const unauthorized = { ok: false, status: 401 };
    fetchMock.mockResolvedValue(unauthorized);

    await expect(runner.transform(Promise.resolve(unauthorized as Response))).resolves.toBe(unauthorized);
    expect(tokenRenewer.invalidateAccessToken).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const headers: Headers = fetchMock.mock.calls[0][1].headers;

    expect(headers.get('Authorization')).toBe('Bearer new-access');
    expect(headers.get('X-Other')).toBe('value');
  });

  it('should return the replayed response', async () => {
    const plugin = new OAuth2PkceUnauthorizedFetch(tokenRenewer, [401, 403], 'X-Auth');
    const runner = plugin.load({ url: 'https://mgw.test.com', options: {}, fetchPlugins: [] } as any);
    const success = { ok: true, status: 200 };
    fetchMock.mockResolvedValue(success);

    await expect(runner.transform(Promise.resolve({ ok: false, status: 403 } as Response))).resolves.toBe(success);
    expect(fetchMock.mock.calls[0][1].headers.get('X-Auth')).toBe('Bearer new-access');
  });

  it('should return the original response when the token cannot be renewed', async () => {
    tokenRenewer.getAuthorizationHeaderValue.mockResolvedValue(undefined);
    const plugin = new OAuth2PkceUnauthorizedFetch(tokenRenewer);
    const runner = plugin.load({ url: 'https://mgw.test.com', options: {}, fetchPlugins: [] } as any);
    const unauthorized = { ok: false, status: 401 };

    await expect(runner.transform(Promise.resolve(unauthorized as Response))).resolves.toBe(unauthorized);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
