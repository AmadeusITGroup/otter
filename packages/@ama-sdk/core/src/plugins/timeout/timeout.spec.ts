import {EmptyResponseError, ResponseTimeoutError} from '../../fwk/errors';
import {TimeoutFetch} from './timeout.fetch';

describe('Timeout Fetch Plugin', () => {

  it('should reject on timeout', async () => {
    const plugin = new TimeoutFetch(100);

    const runner = plugin.load({} as any);
    const call = new Promise<any>((resolve) => setTimeout(() => resolve(undefined), 1000));

    const callback = jest.fn();
    runner.transform(call).catch(callback);
    await jest.advanceTimersByTimeAsync(99);
    expect(callback).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(1);
    expect(callback).toHaveBeenCalledWith(new ResponseTimeoutError('in 100ms'));
  });

  it('should not reject on fetch rejection', async () => {
    const plugin = new TimeoutFetch(6000);

    const runner = plugin.load({} as any);
    const call = new Promise<any>((_resolve, reject) => setTimeout(() => reject(new EmptyResponseError('')), 100));


    const callback = jest.fn();
    runner.transform(call).catch(callback);
    await jest.advanceTimersByTimeAsync(6000);
    expect(callback).toHaveBeenCalledWith(new EmptyResponseError(''));
  });

  it('should forward the fetch response', async () => {
    const plugin = new TimeoutFetch(2000);

    const runner = plugin.load({} as any);
    const call = new Promise<any>((resolve) => setTimeout(() => resolve({test: true}), 100));

    const promise = runner.transform(call);
    await jest.runAllTimersAsync();

    expect(await promise).toEqual({test: true} as any);
  });

});
