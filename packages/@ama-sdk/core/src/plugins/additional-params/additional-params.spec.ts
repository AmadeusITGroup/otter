/* eslint-disable no-console -- only using the reference */
import {
  RequestOptions,
} from '../core/request-plugin';
import {
  AdditionalParamsRequest,
} from './additional-params-request';
import {
  AdditionalParamsSyncRequest,
} from './additional-params-sync-request';

describe('Additional Params Request Plugin', () => {
  const additionalGetParams = jest.fn().mockReturnValue({ test: 'ok' });
  const additionalBody = jest.fn().mockReturnValue('newBody');

  const defaultGetParams = { defaultTest: 'ok' };
  const defaultBody = 'default';
  let options: RequestOptions;

  beforeEach(() => {
    options = {
      method: 'get',
      queryParams: defaultGetParams,
      headers: new Headers(),
      body: defaultBody,
      basePath: 'http://test.com/truc'
    };
  });

  it('should add a specified query param', async () => {
    const plugin = new AdditionalParamsRequest({ queryParams: { test: 'ok' } });
    const runner = plugin.load();

    const result = await runner.transform(options);

    expect(result.queryParams.test).toBe('ok');
  });

  it('should add serialized query params', async () => {
    options.paramSerializationOptions = { enableParameterSerialization: true };
    const plugin = new AdditionalParamsRequest({ queryParams:
      {
        primParam: { value: 'ok', explode: false, style: 'form' },
        arrParam: { value: ['a', 'b', 'c'], explode: false, style: 'spaceDelimited' },
        objParam: { value: { prop1: 'value1', prop2: 'value2' }, explode: true, style: 'deepObject' }
      }
    });
    const runner = plugin.load();

    const result = await runner.transform(options);

    expect(result.queryParams).toStrictEqual({
      defaultTest: 'ok',
      primParam: 'primParam=ok',
      arrParam: 'arrParam=a%20b%20c',
      objParam: 'objParam%5Bprop1%5D=value1&objParam%5Bprop2%5D=value2'
    });
  });

  it('should not serialize additional query params if param serialization is not enabled', async () => {
    jest.spyOn(console, 'log');
    const plugin = new AdditionalParamsRequest({ queryParams: { test: { value: 'ok', explode: false, style: 'form' } } });
    const runner = plugin.load();

    const result = await runner.transform(options);

    expect(result.queryParams.test).toBe('ok');
    expect(console.log).toHaveBeenCalled();
  });

  it('should not add a specified query param of type string if param serialization is enabled', async () => {
    options.paramSerializationOptions = { enableParameterSerialization: true };
    const plugin = new AdditionalParamsRequest({ queryParams: { test: 'ok' } });
    const runner = plugin.load();

    await expect(runner.transform(options)).rejects.toThrow('It is not possible to serialize additional query parameters without their serialization properties `value`, `explode`, and `style`.');
  });

  it('should add the query params returned by a function', async () => {
    const plugin = new AdditionalParamsRequest({ queryParams: additionalGetParams });
    const runner = plugin.load();

    const result = await runner.transform(options);

    expect(additionalGetParams).toHaveBeenCalledWith(defaultGetParams);
    expect(result.queryParams.test).toBe('ok');
  });

  it('should modify body', async () => {
    const plugin = new AdditionalParamsRequest({ body: additionalBody });
    const runner = plugin.load();

    const result = await runner.transform(options);

    expect(result.queryParams.test).toBeUndefined();
    expect(result.queryParams.defaultTest).toBe('ok');

    expect(additionalBody).toHaveBeenCalledWith(defaultBody);
    expect(result.body).toBe('newBody');
  });
});

describe('Additional Params Request Sync Plugin', () => {
  const additionalGetParams = jest.fn().mockReturnValue({ test: 'ok' });
  const additionalBody = jest.fn().mockReturnValue('newBody');

  const defaultGetParams = { defaultTest: 'ok' };
  const defaultBody = 'default';
  let options: RequestOptions;

  beforeEach(() => {
    options = {
      method: 'get',
      queryParams: defaultGetParams,
      headers: new Headers(),
      body: defaultBody,
      basePath: 'http://test.com/truc'
    };
  });

  it('should add a specified query param', () => {
    const plugin = new AdditionalParamsSyncRequest({ queryParams: { test: 'ok' } });
    const runner = plugin.load();

    const result = runner.transform(options);

    expect(result.queryParams.test).toBe('ok');
  });

  it('should add serialized query params', () => {
    options.paramSerializationOptions = { enableParameterSerialization: true };
    const plugin = new AdditionalParamsSyncRequest({ queryParams:
        {
          primParam: { value: 'ok', explode: false, style: 'form' },
          arrParam: { value: ['a', 'b', 'c'], explode: false, style: 'spaceDelimited' },
          objParam: { value: { prop1: 'value1', prop2: 'value2' }, explode: true, style: 'deepObject' }
        }
    });
    const runner = plugin.load();

    const result = runner.transform(options);

    expect(result.queryParams).toStrictEqual({
      defaultTest: 'ok',
      primParam: 'primParam=ok',
      arrParam: 'arrParam=a%20b%20c',
      objParam: 'objParam%5Bprop1%5D=value1&objParam%5Bprop2%5D=value2'
    });
  });

  it('should not serialize additional query params if param serialization is not enabled', () => {
    jest.spyOn(console, 'log');
    const plugin = new AdditionalParamsSyncRequest({ queryParams: { test: { value: 'ok', explode: false, style: 'form' } } });
    const runner = plugin.load();

    const result = runner.transform(options);

    expect(result.queryParams.test).toBe('ok');
    expect(console.log).toHaveBeenCalled();
  });

  it('should not add a specified query param of type string if param serialization is enabled', () => {
    options.paramSerializationOptions = { enableParameterSerialization: true };
    const plugin = new AdditionalParamsSyncRequest({ queryParams: { test: 'ok' } });
    const runner = plugin.load();

    expect(() => runner.transform(options)).toThrow('It is not possible to serialize additional query parameters without their serialization properties `value`, `explode`, and `style`.');
  });

  it('should add the query params returned by a function', () => {
    const plugin = new AdditionalParamsSyncRequest({ queryParams: additionalGetParams });
    const runner = plugin.load();

    const result = runner.transform(options);

    expect(additionalGetParams).toHaveBeenCalledWith(defaultGetParams);
    expect(result.queryParams.test).toBe('ok');
  });

  it('should modify body', () => {
    const plugin = new AdditionalParamsSyncRequest({ body: additionalBody });
    const runner = plugin.load();

    const result = runner.transform(options);

    expect(result.queryParams.test).toBeUndefined();
    expect(result.queryParams.defaultTest).toBe('ok');

    expect(additionalBody).toHaveBeenCalledWith(defaultBody);
    expect(result.body).toBe('newBody');
  });
});
