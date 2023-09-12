import { createBase64Decoder, createBase64UrlDecoder, createBase64UrlEncoder } from '../../utils/json-token';
import { RequestOptions } from '../core';
import {
  hmacSHA256,
  JsonTokenPayload, MicroGatewayMiddlewareAuthenticationRequest,
  MicroGatewayMiddlewareAuthenticationRequestConstructor, sha256
} from './mgw-mdw-auth.request';

const authHeaderKey = 'Bearer ';

let options: RequestOptions;

class FakeHeader {
  private readonly items = new Map();

  public get = (a) => this.items.get(a);
  public has = (a) => this.items.has(a);
  public append = (a, b) => this.items.set(a, b);
}

const jsonAuthTokenOptions: MicroGatewayMiddlewareAuthenticationRequestConstructor = {
  applicationId: '6X_MG__tester@test.com__PDT',
  apiKey: 'dummy4P1K3Y',
  expIntervalInSec: 60,
  secret: 'super-secret',
  context: {
    oid: 'NCE1A0955'
  }
};

describe('JSON auth token request plugin', () => {

  beforeEach(() => {
    options = {
      basePath: 'https://domain.com/v2/shopping/air-offers',
      headers: new FakeHeader() as any,
      method: 'GET'
    };
  });

  afterAll(() => {
    (global as any).sessionStorage = undefined;
  });

  it('should add a Bearer in the header', async () => {
    const plugin = new MicroGatewayMiddlewareAuthenticationRequest(jsonAuthTokenOptions);
    const result = await plugin.load().transform(options);

    expect(result.headers.has(authHeaderKey)).toBeTruthy();
  });

  it('should check that the jws token is well formatted', async () => {
    const plugin = new MicroGatewayMiddlewareAuthenticationRequest(jsonAuthTokenOptions);
    const result = await plugin.load().transform(options);
    const token = result.headers.get(authHeaderKey);
    const tokenParts = token.split('.');

    expect(token).toBeDefined();
    expect(tokenParts.length).toEqual(3);
  });

  it('should check that the header is properly set', async () => {
    const base64URLDecoder = createBase64UrlDecoder();

    const plugin = new MicroGatewayMiddlewareAuthenticationRequest(jsonAuthTokenOptions);
    const result = await plugin.load().transform(options);
    const token = result.headers.get(authHeaderKey);

    expect(token).toBeDefined();

    const tokenParts = token.split('.');
    const header = JSON.parse(base64URLDecoder(tokenParts[0]));

    expect(header.alg).toBeDefined();
    expect(header.alg).toEqual('HS256');
    expect(header.typ).toBeDefined();
    expect(header.typ).toEqual('JWT');
  });

  it('should check that the payload is properly set', async () => {
    const base64URLDecoder = createBase64UrlDecoder();
    const base64Decoder = createBase64Decoder();

    const plugin = new MicroGatewayMiddlewareAuthenticationRequest(jsonAuthTokenOptions);
    const result = await plugin.load().transform(options);
    const token = result.headers.get(authHeaderKey);

    expect(token).toBeDefined();

    const tokenParts = token.split('.');
    const payload = JSON.parse(base64URLDecoder(tokenParts[1]));

    expect(payload.jti).toBeDefined();
    expect(payload.iat).toBeDefined();
    expect(payload.exp).toBeDefined();
    expect(payload.iss).toBeDefined();
    expect(payload.iss).toEqual(jsonAuthTokenOptions.applicationId);
    expect(payload.context).toBeDefined();

    const context = JSON.parse(base64Decoder(payload.context));

    expect(context.oid).toBeDefined();
    expect(context.oid).toEqual(jsonAuthTokenOptions.context.oid);
  });

  it('should check the signature validity', async () => {
    const base64URLDecoder = createBase64UrlDecoder();
    const base64UrlEncoder = createBase64UrlEncoder();

    const plugin = new MicroGatewayMiddlewareAuthenticationRequest(jsonAuthTokenOptions);
    const result = await plugin.load().transform(options);
    const token = result.headers.get(authHeaderKey);

    const tokenParts = token.split('.');
    const header = JSON.parse(base64URLDecoder(tokenParts[0]));
    const payload: JsonTokenPayload = JSON.parse(base64URLDecoder(tokenParts[1]));
    const signature = tokenParts[2];

    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    const secretKey = await sha256(jsonAuthTokenOptions.apiKey + (await sha256(jsonAuthTokenOptions.secret + payload.jti + payload.iat.toString() + options.basePath)));
    const message = `${base64UrlEncoder(JSON.stringify(header)) }.${base64UrlEncoder(JSON.stringify(payload)) }`;
    const signCheck = base64UrlEncoder(hmacSHA256(message, secretKey));

    expect(signature).toEqual(signCheck);
  });
});
