import {EmptyResponseError, ResponseTimeoutError} from '../../fwk/errors';
import {TimeoutFetch, TimeoutStatus} from './timeout.fetch';

describe('Timeout Fetch Plugin', () => {

  it('should reject on timeout', async () => {
    const plugin = new TimeoutFetch(100);

    const runner = plugin.load({controller: new AbortController()} as any);
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

    const runner = plugin.load({controller: new AbortController()} as any);
    const call = new Promise<any>((_resolve, reject) => setTimeout(() => reject(new EmptyResponseError('')), 100));


    const callback = jest.fn();
    runner.transform(call).catch(callback);
    await jest.advanceTimersByTimeAsync(6000);
    expect(callback).toHaveBeenCalledWith(new EmptyResponseError(''));
  });

  it('should forward the fetch response', async () => {
    const plugin = new TimeoutFetch(2000);

    const runner = plugin.load({controller: new AbortController()} as any);
    const call = new Promise<any>((resolve) => setTimeout(() => resolve({test: true}), 100));

    const promise = runner.transform(call);
    await jest.runAllTimersAsync();

    expect(await promise).toEqual({test: true} as any);
  });

  it('should not reject if the timeout has been paused and reject if restarted', async () => {
    const timeoutPauseEvent = {
      emitEvent: (_status: TimeoutStatus) => {},
      handler: (timeoutPauseCallback: (status: TimeoutStatus) => void) => {
        timeoutPauseEvent.emitEvent = timeoutPauseCallback;
        return () => {};
      }
    };
    const plugin = new TimeoutFetch(100, timeoutPauseEvent.handler);

    const runner = plugin.load({controller: new AbortController()} as any);
    const call = new Promise<any>((resolve) => setTimeout(() => resolve({test: true}), 500));
    const callback = jest.fn();
    runner.transform(call).catch(callback);
    timeoutPauseEvent.emitEvent('timeoutStopped');
    await jest.advanceTimersByTimeAsync(200);
    timeoutPauseEvent.emitEvent('timeoutStarted');
    await jest.advanceTimersByTimeAsync(200);
    expect(callback).toHaveBeenCalledWith(new ResponseTimeoutError('in 100ms'));
  });

  it('should take into account pause events triggered before the call', async () => {
    const timeoutPauseEvent = {
      emitEvent: (_status: TimeoutStatus) => {},
      handler: (timeoutPauseCallback: (status: TimeoutStatus) => void) => {
        timeoutPauseEvent.emitEvent = timeoutPauseCallback;
        return () => {};
      }
    };
    const plugin = new TimeoutFetch(250, timeoutPauseEvent.handler);

    const runner = plugin.load({controller: new AbortController()} as any);
    const call = new Promise<any>((resolve) => setTimeout(() => resolve({test: true}), 500));
    timeoutPauseEvent.emitEvent('timeoutStopped');
    const promise = runner.transform(call);
    await jest.runAllTimersAsync();

    expect(await promise).toEqual({test: true} as any);
  });
});
