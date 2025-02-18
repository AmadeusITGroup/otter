import {
  RequestOptions,
} from '../core/request-plugin';
import {
  AdditionalParamsSyncRequest,
} from './additional-params-sync.request';
import {
  AdditionalParamsRequest,
} from './additional-params.request';

describe('Additional Params Request Plugin', () => {
  const additionalGetParams = jest.fn().mockReturnValue({ test: 'ok' });
  const additionalGetParameters = jest.fn().mockReturnValue({ test: { value: 'ok', exploded: true, style: 'form' } });
  const additionalBody = jest.fn().mockReturnValue('newBody');

  const defaultGetParams = { defaultTest: 'ok' };
  const defaultGetParameters = { defaultTest: { value: 'ok', exploded: true, style: 'form' } };
  const defaultBody = 'default';
  let options: RequestOptions;

  beforeEach(() => {
    options = {
      method: 'get',
      queryParams: defaultGetParams,
      queryParameters: defaultGetParameters,
      headers: new Headers(),
      body: defaultBody,
      basePath: 'http://test.com/truc'
    };
  });

  it('should add a specified query param', async () => {
    const plugin = new AdditionalParamsRequest({ queryParams: { test: 'ok' }, queryParameters: { test: { value: 'ok', exploded: true, style: 'form' } } });
    const runner = plugin.load();

    const result = await runner.transform(options);

    expect(result.queryParams.test).toBe('ok');
    expect(result.queryParameters.test.value).toBe('ok');
  });

  it('should add the query params returned by a function', async () => {
    const plugin = new AdditionalParamsRequest({ queryParams: additionalGetParams, queryParameters: additionalGetParameters });
    const runner = plugin.load();

    const result = await runner.transform(options);

    expect(additionalGetParams).toHaveBeenCalledWith(defaultGetParams);
    expect(result.queryParams.test).toBe('ok');
    expect(additionalGetParameters).toHaveBeenCalledWith(defaultGetParameters);
    expect(result.queryParameters.test.value).toBe('ok');
  });

  it('should modify body', async () => {
    const plugin = new AdditionalParamsRequest({ body: additionalBody });
    const runner = plugin.load();

    const result = await runner.transform(options);

    expect(result.queryParams.test).toBeUndefined();
    expect(result.queryParams.defaultTest).toBe('ok');
    expect(result.queryParameters.test).toBeUndefined();
    expect(result.queryParameters.defaultTest.value).toBe('ok');

    expect(additionalBody).toHaveBeenCalledWith(defaultBody);
    expect(result.body).toBe('newBody');
  });
});

describe('Additional Params Request Sync Plugin', () => {
  const additionalGetParams = jest.fn().mockReturnValue({ test: 'ok' });
  const additionalGetParameters = jest.fn().mockReturnValue({ test: { value: 'ok', exploded: true, style: 'form' } });
  const additionalBody = jest.fn().mockReturnValue('newBody');

  const defaultGetParams = { defaultTest: 'ok' };
  const defaultGetParameters = { defaultTest: { value: 'ok', exploded: true, style: 'form' } };
  const defaultBody = 'default';
  let options: RequestOptions;

  beforeEach(() => {
    options = {
      method: 'get',
      queryParams: defaultGetParams,
      queryParameters: defaultGetParameters,
      headers: new Headers(),
      body: defaultBody,
      basePath: 'http://test.com/truc'
    };
  });

  it('should add a specified query param', () => {
    const plugin = new AdditionalParamsSyncRequest({ queryParams: { test: 'ok' }, queryParameters: { test: { value: 'ok', exploded: true, style: 'form' } } });
    const runner = plugin.load();

    const result = runner.transform(options);

    expect(result.queryParams.test).toBe('ok');
    expect(result.queryParameters.test.value).toBe('ok');
  });

  it('should add the query params returned by a function', () => {
    const plugin = new AdditionalParamsSyncRequest({ queryParams: additionalGetParams, queryParameters: additionalGetParameters });
    const runner = plugin.load();

    const result = runner.transform(options);

    expect(additionalGetParams).toHaveBeenCalledWith(defaultGetParams);
    expect(result.queryParams.test).toBe('ok');
    expect(additionalGetParameters).toHaveBeenCalledWith(defaultGetParameters);
    expect(result.queryParameters.test.value).toBe('ok');
  });

  it('should modify body', () => {
    const plugin = new AdditionalParamsSyncRequest({ body: additionalBody });
    const runner = plugin.load();

    const result = runner.transform(options);

    expect(result.queryParams.test).toBeUndefined();
    expect(result.queryParams.defaultTest).toBe('ok');
    expect(result.queryParameters.test).toBeUndefined();
    expect(result.queryParameters.defaultTest.value).toBe('ok');

    expect(additionalBody).toHaveBeenCalledWith(defaultBody);
    expect(result.body).toBe('newBody');
  });
});
