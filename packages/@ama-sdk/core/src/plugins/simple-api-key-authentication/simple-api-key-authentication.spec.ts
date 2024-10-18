import {
  createBase64UrlDecoder
} from '../../utils/json-token';
import {
  RequestOptions
} from '../core/request-plugin';
import {
  SimpleApiKeyAuthenticationRequest
} from './simple-api-key-authentication.request';

const base64UrlDecoder = createBase64UrlDecoder();

function getJWTPayload(jwt: string) {
  return JSON.parse(base64UrlDecoder(jwt.split('.')[1]));
}

function returnInSequence<T>(...values: T[]) {
  let index = 0;
  return () => values[index++];
}

describe('Api Key Request Plugin', () => {
  let options: RequestOptions;

  beforeEach(() => {
    const headers = new Headers();
    options = { headers, basePath: 'http://test.com', method: 'get' };
  });

  it('Static API key should be added to the default header.', async () => {
    const plugin = new SimpleApiKeyAuthenticationRequest('key');
    const runner = plugin.load();

    await runner.transform(options);

    expect(options.headers.get('x-api-key')).toBe('key');
  });

  it('Static API key should be added to the specified header.', async () => {
    const plugin = new SimpleApiKeyAuthenticationRequest('key', {
      apiKeyHeader: 'custom-header'
    });
    const runner = plugin.load();

    await runner.transform(options);

    expect(options.headers.get('custom-header')).toBe('key');
    expect(options.headers.get('x-api-key')).toBeNull();
  });

  it('Static OID override should compute the right ama-ctx', async () => {
    const plugin = new SimpleApiKeyAuthenticationRequest('key', {
      officeId: 'TESTOID'
    });
    const runner = plugin.load();

    await runner.transform(options);
    const amaCtx = options.headers.get('ama-ctx');

    expect(amaCtx).toBeDefined();
    expect(getJWTPayload(amaCtx)).toEqual(expect.objectContaining({
      oid: 'TESTOID'
    }));
  });

  it('API key and OID as functions that return strings should result in the right headers', async () => {
    const plugin = new SimpleApiKeyAuthenticationRequest(returnInSequence('key', 'secondKey'), {
      officeId: returnInSequence('TESTOID', 'SECONDOID')
    });
    const runner = plugin.load();

    await runner.transform(options);
    let amaCtx = options.headers.get('ama-ctx');

    expect(options.headers.get('x-api-key')).toBe('key');
    expect(amaCtx).toBeDefined();
    expect(getJWTPayload(amaCtx)).toEqual(expect.objectContaining({
      oid: 'TESTOID'
    }));

    await runner.transform(options);
    amaCtx = options.headers.get('ama-ctx');

    expect(options.headers.get('x-api-key')).toBe('secondKey');
    expect(amaCtx).toBeDefined();
    expect(getJWTPayload(amaCtx)).toEqual(expect.objectContaining({
      oid: 'SECONDOID'
    }));
  });

  it('API key and OID as functions that return promises should result in the right headers', async () => {
    const plugin = new SimpleApiKeyAuthenticationRequest(returnInSequence(Promise.resolve('key'), Promise.resolve('secondKey')), {
      officeId: returnInSequence(Promise.resolve('TESTOID'), Promise.resolve('SECONDOID'))
    });
    const runner = plugin.load();

    await runner.transform(options);
    let amaCtx = options.headers.get('ama-ctx');

    expect(options.headers.get('x-api-key')).toBe('key');
    expect(amaCtx).toBeDefined();
    expect(getJWTPayload(amaCtx)).toEqual(expect.objectContaining({
      oid: 'TESTOID'
    }));

    await runner.transform(options);
    amaCtx = options.headers.get('ama-ctx');

    expect(options.headers.get('x-api-key')).toBe('secondKey');
    expect(amaCtx).toBeDefined();
    expect(getJWTPayload(amaCtx)).toEqual(expect.objectContaining({
      oid: 'SECONDOID'
    }));
  });

  it('Setting API key and OID using the setters should result in the right headers', async () => {
    const plugin = new SimpleApiKeyAuthenticationRequest('key');
    const runner = plugin.load();

    await runner.transform(options);
    let amaCtx = options.headers.get('ama-ctx');

    expect(options.headers.get('x-api-key')).toBe('key');
    expect(amaCtx).toBeNull();

    plugin.setApiKey('secondApiKey');
    plugin.setOfficeId('OID');
    await runner.transform(options);
    amaCtx = options.headers.get('ama-ctx');

    expect(options.headers.get('x-api-key')).toBe('secondApiKey');
    expect(amaCtx).toBeDefined();
    expect(getJWTPayload(amaCtx)).toEqual(expect.objectContaining({
      oid: 'OID'
    }));
  });
});
