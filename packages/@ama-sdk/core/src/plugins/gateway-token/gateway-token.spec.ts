import {RequestOptions} from '../core/request-plugin';
import {Oauth2Api, TokenTypeEnum} from './gateway-authentication';
import {GatewayTokenRequestPlugin} from './gateway-token.request';

// Storage Mock
const storageMock = () => {
  const storage = {};

  return {
    setItem: (key, value) => {
      storage[key] = value || '';
    },
    getItem: (key) => {
      return key in storage ? storage[key] : null;
    },
    removeItem: (key) => {
      delete storage[key];
    }
  };
};

describe('Gateway token plugin', () => {

  const defaultGetParams = {defaultTest: 'ok'};
  const defaultBody = 'default';
  const defaultUrl = 'http://test.com/truc';

  const defaultGatewayAPIConfig = {
    baseUrl: defaultUrl,
    gatewayClientId: 'RgquoWaPkKmZ7acKUu1A2meEYVo94az7',
    gatewayClientSecret: 'AdUgFh4hu1dUUIE1'
  };

  let options: RequestOptions;

  beforeEach(() => {
    const headers = new Headers();
    headers.append('Content-Type', 'image/jpeg');
    headers.append('Accept-Encoding', 'gzip');
    options = {
      queryParams: defaultGetParams,
      headers,
      body: defaultBody,
      basePath: defaultUrl
    };
    (global as any).sessionStorage = storageMock();
    sessionStorage.removeItem('gateway-auth-tokens');
  });

  afterAll(() => {
    (global as any).sessionStorage = undefined;
  });

  it('should get the token from session storage', async () => {
    const tempToken = 'qhxZi73NEaeUoHDttkRpXlKPgbUv';
    const sessionStorageKey = `${defaultGatewayAPIConfig.gatewayClientId}-default`;
    sessionStorage.setItem('gateway-auth-tokens', JSON.stringify({
      [sessionStorageKey]: {expiresAt: Date.now() + 28800 * 1000, token: tempToken}
    }));

    const gatewayPlugin = new GatewayTokenRequestPlugin(
      `${defaultGatewayAPIConfig.baseUrl}/v1/security/oauth2`,
      defaultGatewayAPIConfig.gatewayClientId,
      defaultGatewayAPIConfig.gatewayClientSecret
    );

    const spy = jest.spyOn(Oauth2Api.prototype, 'postAccessToken');
    const runner = gatewayPlugin.load();
    const e = await runner.transform(options);

    expect(spy).not.toHaveBeenCalled();
    expect(e.headers.get('authorization')).toBe(`Bearer ${tempToken}`);
  });

  it('should call the gateway api to take the token and save it in session storage', async () => {
    const gatewayPlugin = new GatewayTokenRequestPlugin(
      `${defaultGatewayAPIConfig.baseUrl}/v1/security/oauth2`,
      defaultGatewayAPIConfig.gatewayClientId,
      defaultGatewayAPIConfig.gatewayClientSecret
    );
    const accessToken = '1234567890';
    const sessionStorageKey = `${defaultGatewayAPIConfig.gatewayClientId}-default`;
    const spy = jest.spyOn(Oauth2Api.prototype, 'postAccessToken').mockReturnValue(Promise.resolve({
      /* eslint-disable @typescript-eslint/naming-convention, camelcase */
      access_token: accessToken,
      expires_in: 300,
      token_type: 'Bearer' as TokenTypeEnum
      /* eslint-enable @typescript-eslint/naming-convention, camelcase */
    }));

    const runner = gatewayPlugin.load();
    const e = await runner.transform(options);

    expect(spy).toHaveBeenCalled();
    expect(e.headers.get('authorization')).toBe(`Bearer ${accessToken}`);

    const tokenValue = JSON.parse(sessionStorage.getItem('gateway-auth-tokens'))[sessionStorageKey];

    expect(tokenValue.token).toBe(accessToken);
  });

  it('should call the gateway api if the token in session storage is expired', async () => {
    const gatewayPlugin = new GatewayTokenRequestPlugin(
      `${defaultGatewayAPIConfig.baseUrl}/v1/security/oauth2`,
      defaultGatewayAPIConfig.gatewayClientId,
      defaultGatewayAPIConfig.gatewayClientSecret
    );
    const sessionStorageKey = `${defaultGatewayAPIConfig.gatewayClientId}-default`;
    sessionStorage.setItem('gateway-auth-tokens', JSON.stringify({
      [sessionStorageKey]: {expiresAt: Date.now(), token: 'qhxZi73NEaeUoHDttkRpXlKPgbUv'}
    }));

    const expectedToken = '1234567890';
    const spy = jest.spyOn(Oauth2Api.prototype, 'postAccessToken').mockReturnValue(Promise.resolve({
      /* eslint-disable @typescript-eslint/naming-convention, camelcase */
      access_token: expectedToken,
      expires_in: 300,
      token_type: 'Bearer' as TokenTypeEnum
      /* eslint-enable @typescript-eslint/naming-convention, camelcase */
    }));

    const runner = gatewayPlugin.load();
    const e = await runner.transform(options);

    expect(spy).toHaveBeenCalled();
    expect(e.headers.get('authorization')).toBe(`Bearer ${expectedToken}`);

    const tokenValue = JSON.parse(sessionStorage.getItem('gateway-auth-tokens'))[sessionStorageKey];

    expect(tokenValue.token).toBe(expectedToken);
  });

  it('should save the token in session storage with the reference of the provided guest office ID', async () => {
    const guestOfficeId = 'XXXXXX';
    const sessionStorageKey = `${defaultGatewayAPIConfig.gatewayClientId}-${guestOfficeId}`;

    const gatewayPlugin = new GatewayTokenRequestPlugin(
      `${defaultGatewayAPIConfig.baseUrl}/v1/security/oauth2`,
      defaultGatewayAPIConfig.gatewayClientId,
      defaultGatewayAPIConfig.gatewayClientSecret,
      guestOfficeId
    );

    const expectedToken = '1234567890';
    const spy = jest.spyOn(Oauth2Api.prototype, 'postAccessToken').mockReturnValue(Promise.resolve({
      /* eslint-disable @typescript-eslint/naming-convention, camelcase */
      access_token: expectedToken,
      expires_in: 300,
      token_type: 'Bearer' as TokenTypeEnum
      /* eslint-enable @typescript-eslint/naming-convention, camelcase */
    }));

    const runner = gatewayPlugin.load();
    const e = await runner.transform(options);

    expect(spy).toHaveBeenCalled();
    expect(e.headers.get('authorization')).toBe(`Bearer ${expectedToken}`);

    const tokenValue = JSON.parse(sessionStorage.getItem('gateway-auth-tokens'))[sessionStorageKey];

    expect(tokenValue.token).toBe(expectedToken);
  });

  it('should save the token in session storage with the reference', async () => {
    let guestOfficeId = 'XXXXXX';
    let sessionStorageKey = `${defaultGatewayAPIConfig.gatewayClientId}-${guestOfficeId}`;
    const guestOfficeIdRule = () => Promise.resolve(guestOfficeId);

    const gatewayPlugin = new GatewayTokenRequestPlugin(
      `${defaultGatewayAPIConfig.baseUrl}/v1/security/oauth2`,
      defaultGatewayAPIConfig.gatewayClientId,
      defaultGatewayAPIConfig.gatewayClientSecret,
      guestOfficeIdRule
    );

    let isFirstCall = true;
    const expectedToken1 = '111111111';
    const expectedToken2 = '222222222';
    const spy = jest.spyOn(Oauth2Api.prototype, 'postAccessToken').mockImplementation(() => {
      return Promise.resolve({
        /* eslint-disable @typescript-eslint/naming-convention, camelcase */
        access_token: isFirstCall ? '111111111' : '222222222',
        expires_in: 300,
        token_type: 'Bearer' as TokenTypeEnum
        /* eslint-enable @typescript-eslint/naming-convention, camelcase */
      });
    });

    const runner = gatewayPlugin.load();

    await runner.transform(options);

    expect(spy).toHaveBeenCalled();

    let tokenValue = JSON.parse(sessionStorage.getItem('gateway-auth-tokens'))[sessionStorageKey];

    expect(tokenValue.token).toBe(expectedToken1);

    isFirstCall = false;
    guestOfficeId = 'YYYYYY';
    sessionStorageKey = `${defaultGatewayAPIConfig.gatewayClientId}-${guestOfficeId}`;

    await runner.transform(options);

    expect(spy).toHaveBeenCalled();

    tokenValue = JSON.parse(sessionStorage.getItem('gateway-auth-tokens'))[sessionStorageKey];

    expect(tokenValue.token).toBe(expectedToken2);
  });

});
