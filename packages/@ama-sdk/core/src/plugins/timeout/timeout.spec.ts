import {EmptyResponseError, ResponseTimeoutError} from '../../fwk/errors';
import {TimeoutFetch} from './timeout.fetch';

describe('Timeout Fetch Plugin', () => {

  it('should reject on timeout', () => {
    const plugin = new TimeoutFetch(100);

    const runner = plugin.load({} as any);
    const call = new Promise<any>((resolve) => setTimeout(() => resolve(undefined), 1000));

    return runner.transform(call)
      .catch((err) => {
        expect(err).toEqual(new ResponseTimeoutError('in 100ms'));
      });
  });

  it('should not reject on fetch rejection', () => {
    const plugin = new TimeoutFetch(6000);

    const runner = plugin.load({} as any);
    const call = new Promise<any>((_resolve, reject) => setTimeout(() => reject(new EmptyResponseError('')), 100));

    return runner.transform(call)
      .catch((err) => {
        expect(err).toEqual(new EmptyResponseError(''));
      });
  });

  it('should forward the fecth response', async () => {
    const plugin = new TimeoutFetch(2000);

    const runner = plugin.load({} as any);
    const call = new Promise<any>((resolve) => setTimeout(() => resolve({test: true}), 100));

    const response = await runner.transform(call);

    expect(response).toEqual({test: true} as any);
  });

});
