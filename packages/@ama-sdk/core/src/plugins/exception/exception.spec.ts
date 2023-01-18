import { ApiTypes } from '../../fwk/api';
import { EmptyResponseError, RequestFailedError } from '../../fwk/errors';
import { ExceptionReply } from './exception.reply';

describe('Exception Reply Plugin', () => {

  const reviver = jest.fn();
  const contextError = {
    apiName: 'api',
    operationId: 'ope'
  };

  it('should throw on empty data and contains errors key if DAPI', () => {
    const plugin = new ExceptionReply();
    const runner = plugin.load({
      reviver,
      apiType: ApiTypes.DAPI,
      response: {ok: true, status: 200, statusText: 'test'} as any,
      ...contextError
    });
    const data = {errors: []};

    expect(() => runner.transform(data)).toThrow(new EmptyResponseError('test', data, contextError));
  });

  it('should not throw on empty data and no errors key if DAPI', () => {
    const plugin = new ExceptionReply();
    const runner = plugin.load({
      reviver,
      apiType: ApiTypes.DAPI,
      response: {ok: true, status: 200, statusText: 'test'} as any
    });
    const data = {};

    expect(() => runner.transform(data)).not.toThrow();
  });

  it('should not throw on empty data if not DAPI', () => {
    const plugin = new ExceptionReply();
    const runner = plugin.load({
      reviver,
      apiType: ApiTypes.DEFAULT,
      response: {ok: true, status: 200, statusText: 'test'} as any
    });
    const data = {};

    expect(() => runner.transform(data)).not.toThrow();
  });

  it('should throw on nok status', () => {
    const plugin = new ExceptionReply();
    const runner = plugin.load({
      reviver,
      apiType: ApiTypes.DAPI,
      response: {ok: false, status: 444, statusText: 'test'} as any,
      ...contextError
    });
    const data = {data: {}};

    expect(() => runner.transform(data)).toThrow(new RequestFailedError('test', 444, data, contextError));
  });

  it('should not throw if there is already an exception', () => {
    const plugin = new ExceptionReply();
    const runner = plugin.load({
      reviver,
      apiType: ApiTypes.DAPI,
      response: {ok: false, status: 444, statusText: 'test'} as any,
      exception: new Error()
    });
    const data = {data: {}};

    expect(() => runner.transform(data)).not.toThrow();
  });
});
