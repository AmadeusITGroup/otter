import * as jsonToken from '../../utils/json-token';
import {
  DeepLinkOptions,
  RequestMetadata,
  RequestOptions,
  TokenizedOptions
} from '../core/request-plugin';
import {
  PiiTokenizerRequest
} from './pii-tokenizer.request';

describe('Tokenizer Request Plugin', () => {
  let options: RequestOptions;

  const tokenizedOptions: TokenizedOptions = {
    url: 'http://test.com/path/$pathParamToken$',
    queryParams: {
      classicParam: 'classicParamValue',
      sensitiveParam: '$sensitiveParamToken$'
    },
    values: {
      $pathParamToken$: 'pathParamValue',
      $sensitiveParamToken$: 'sensitiveParamValue'
    }
  };

  beforeEach(() => {
    options = {
      method: 'get',
      headers: new Headers(),
      basePath: 'http://test.com/path/pathParamValue',
      queryParams: {
        classicParam: 'classicParamValue',
        sensitiveParam: 'sensitiveParamValue'
      }
    };

    jest.spyOn(console, 'error');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should replace sensitive parameters with tokens', async () => {
    const plugin = new PiiTokenizerRequest({ applicationId: 'app-id' });
    const runner = plugin.load();

    const result = await runner.transform({ ...options, tokenizedOptions });

    expect(result.basePath).toEqual('http://test.com/path/$pathParamToken$');
    expect(result.queryParams.classicParam).toEqual('classicParamValue');
    expect(result.queryParams.sensitiveParam).toEqual('$sensitiveParamToken$');
    expect(result.headers.get('ama-client-facts')).not.toBeNull();
  });

  it('should put token-value associations in custom header if provided', async () => {
    const plugin = new PiiTokenizerRequest({ applicationId: 'app-id', headerName: 'custom-header' });
    const runner = plugin.load();

    const result = await runner.transform({ ...options, tokenizedOptions });

    expect(result.headers.get('ama-client-facts')).toBeNull();
    expect(result.headers.get('custom-header')).not.toBeNull();
  });

  it('should keep default parameters and print an error if tokenization is disabled', async () => {
    const plugin = new PiiTokenizerRequest({ applicationId: 'app-id' });
    const runner = plugin.load();

    const result = await runner.transform(options);

    expect(result.basePath).toEqual('http://test.com/path/pathParamValue');
    expect(result.queryParams.classicParam).toEqual('classicParamValue');
    expect(result.queryParams.sensitiveParam).toEqual('sensitiveParamValue');
    expect(result.headers.get('ama-client-facts')).toBeNull();
    // eslint-disable-next-line no-console -- not calling console.error but expect if it has been called or not
    expect(console.error).toHaveBeenCalled();
  });

  it('should keep default parameters if no token-value associations is provided', async () => {
    const plugin = new PiiTokenizerRequest({ applicationId: 'app-id' });
    const runner = plugin.load();

    const result = await runner.transform({ ...options, tokenizedOptions: { ...tokenizedOptions, values: {} } });

    expect(result.basePath).toEqual('http://test.com/path/pathParamValue');
    expect(result.queryParams.classicParam).toEqual('classicParamValue');
    expect(result.queryParams.sensitiveParam).toEqual('sensitiveParamValue');
    expect(result.headers.get('ama-client-facts')).toBeNull();
    // eslint-disable-next-line no-console -- not calling console.error but expect if it has been called or not
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should use JWT if no key specified', async () => {
    const mockJweEncoder = jest.spyOn(jsonToken, 'createJweEncoder');
    const mockJwtEncoder = jest.spyOn(jsonToken, 'createJwtEncoder');

    const plugin = new PiiTokenizerRequest({ applicationId: 'app-id' });
    const runner = plugin.load();

    await runner.transform({ ...options, tokenizedOptions });

    expect(mockJweEncoder).not.toHaveBeenCalled();
    expect(mockJwtEncoder).toHaveBeenCalled();
  });

  it('should use JWE if a key is specified', async () => {
    jest.spyOn(Date, 'now').mockImplementation(() => 0);
    const key = { publicKey: 'myPublicKey' as any, keyId: 'TEST' };
    const mockJweEncoder = jest.fn().mockResolvedValue('myJweToken');
    jest.spyOn(jsonToken, 'createJweEncoder').mockImplementation(() => mockJweEncoder);
    const mockJwtEncoder = jest.spyOn(jsonToken, 'createJwtEncoder');

    const plugin = new PiiTokenizerRequest({ applicationId: 'app-id', key });
    const runner = plugin.load();

    const result = await runner.transform({ ...options, tokenizedOptions });
    const expectedJwePayload = {
      // eslint-disable-next-line @typescript-eslint/naming-convention -- naming convention imposed for Amadeus JWE
      'ama-tokens': {
        $pathParamToken$: 'pathParamValue',
        $sensitiveParamToken$: 'sensitiveParamValue'
      },
      exp: 3600,
      iat: 0,
      iss: 'app-id',
      sub: 'pii'
    };

    expect(result.headers.get('ama-client-facts')).toEqual('myJweToken');
    expect(mockJweEncoder).toHaveBeenCalledWith(key, expectedJwePayload, ['iss', 'sub']);
    expect(mockJwtEncoder).not.toHaveBeenCalled();
  });

  it('should throw by default if an exception is raised for JWE encoder', async () => {
    const key = { publicKey: 'myPublicKey' as any, keyId: 'TEST' };
    const mockJweEncoder = jest.fn().mockRejectedValue('Error creating JWE');
    jest.spyOn(jsonToken, 'createJweEncoder').mockImplementation(() => mockJweEncoder);

    const plugin = new PiiTokenizerRequest({ applicationId: 'app-id', key });
    const runner = plugin.load();

    await expect(runner.transform({ ...options, tokenizedOptions })).rejects.toThrow();
    expect(mockJweEncoder).toHaveBeenCalled();

    // eslint-disable-next-line no-console -- not calling console.error but expect if it has been called or not
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should handle errors silently if an exception is raised for JWE encoder', async () => {
    const key = { publicKey: 'myPublicKey' as any, keyId: 'TEST' };
    const mockJweEncoder = jest.fn().mockRejectedValue('Error creating JWE');
    jest.spyOn(jsonToken, 'createJweEncoder').mockImplementation(() => mockJweEncoder);

    const plugin = new PiiTokenizerRequest({ applicationId: 'app-id', key, silent: true });
    const runner = plugin.load();

    await expect(runner.transform({ ...options, tokenizedOptions })).resolves.toBeDefined();
    expect(mockJweEncoder).toHaveBeenCalled();
    // eslint-disable-next-line no-console -- not calling console.error but expect if it has been called or not
    expect(console.error).toHaveBeenCalled();
  });

  it('should skip PII tokenization and put DeepLink token in corresponding header when DeepLink token is provided', async () => {
    const plugin = new PiiTokenizerRequest({ applicationId: 'app-id' });
    const runner = plugin.load();

    const deepLinkOptions: DeepLinkOptions = { token: 'myDeepLinkToken' };
    const metadata: RequestMetadata = { deepLinkOptions };
    options.basePath = 'http://test.com/path/$pathParamToken$';
    options.queryParams = { classicParam: 'classicParamValue', sensitiveParam: '$sensitiveParamToken$' };

    const result = await runner.transform({ ...options, tokenizedOptions: { ...tokenizedOptions, values: {} }, metadata });

    expect(result.basePath).toEqual('http://test.com/path/$pathParamToken$');
    expect(result.queryParams.classicParam).toEqual('classicParamValue');
    expect(result.queryParams.sensitiveParam).toEqual('$sensitiveParamToken$');
    expect(result.headers.get('ama-client-facts')).toEqual('myDeepLinkToken');
    // eslint-disable-next-line no-console -- not calling console.error but expect if it has been called or not
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should put DeepLink challenge answers in corresponding header when provided', async () => {
    const plugin = new PiiTokenizerRequest({ applicationId: 'app-id' });
    const runner = plugin.load();

    const deepLinkOptions: DeepLinkOptions = { token: 'myDeepLinkToken', challengeAnswers: { lastName: 'Doe' } };
    const metadata: RequestMetadata = { deepLinkOptions };
    options.basePath = 'http://test.com/path/$pathParamToken$';
    options.queryParams = { classicParam: 'classicParamValue', sensitiveParam: '$sensitiveParamToken$' };

    const result = await runner.transform({ ...options, tokenizedOptions: { ...tokenizedOptions, values: {} }, metadata });

    expect(result.basePath).toEqual('http://test.com/path/$pathParamToken$');
    expect(result.queryParams.classicParam).toEqual('classicParamValue');
    expect(result.queryParams.sensitiveParam).toEqual('$sensitiveParamToken$');
    expect(result.headers.get('ama-client-facts')).toEqual('myDeepLinkToken');
    expect(result.headers.get('ama-client-facts-challenge')).toEqual('{"lastName":"Doe"}');
  });

  it('Should not loose additional parameters not expected for the actual request', async () => {
    const plugin = new PiiTokenizerRequest({ applicationId: 'app-id' });
    const runner = plugin.load();

    options.basePath = 'http://test.com/path/pathParamValue';
    options.queryParams = { ...options.queryParams, additionalParam: 'foo' };

    const result = await runner.transform({ ...options, tokenizedOptions });

    expect(result.basePath).toEqual('http://test.com/path/$pathParamToken$');
    expect(result.queryParams.additionalParam).toEqual('foo');
  });
});
