import {
  RetryFetch,
} from './retry.fetch';

describe('Retry Fetch Plugin', () => {
  it('should not retry on success', async () => {
    const condition = jest.fn().mockReturnValue(true);
    const plugin = new RetryFetch(1, condition);

    const runner = plugin.load({ url: 'http://www.test.com', fetchPlugins: [] } as any);
    const call = Promise.resolve({ text: 'test', ok: true });

    const res = runner.transform(call as any);

    expect(condition).not.toHaveBeenCalled();

    const ret = await res;

    expect(ret).toEqual({ text: 'test', ok: true } as any);
  });

  it('should not retry if refused by the condition', async () => {
    const conditionFalsy = jest.fn().mockReturnValue(false);
    const plugin = new RetryFetch(3, conditionFalsy);

    const runner = plugin.load({ url: 'http://www.test.com', fetchPlugins: [] } as any);
    const call = Promise.resolve({ text: 'test', ok: false, clone: () => ({}) });

    const res = runner.transform(call as any);
    await res;

    expect(conditionFalsy).toHaveBeenCalledTimes(1);
  });

  it('should retry on fetch rejection', async () => {
    const condition = jest.fn().mockReturnValue(true);
    const plugin = new RetryFetch(2, condition);
    const runners: any[] = [];

    const runner = plugin.load({ url: 'not an url', fetchPlugins: runners } as any);
    runners.push(runner);
    const call = Promise.reject(new Error(JSON.stringify({ text: 'test', ok: true })));

    const callback = jest.fn();
    runner.transform(call as any).catch(callback);
    await jest.runAllTimersAsync();
    expect(callback).toHaveBeenCalledWith(expect.objectContaining({}));
    expect(condition).toHaveBeenCalledTimes(2);
  });

  it('should retry on fetch rejection with wait', async () => {
    const condition = jest.fn().mockReturnValue(true);
    const delay = 500;
    const plugin = new RetryFetch(2, condition, () => delay);
    const runners: any[] = [];

    const runner = plugin.load({ url: 'not an url', fetchPlugins: runners } as any);
    runners.push(runner);
    const call = Promise.reject(new Error(JSON.stringify({ text: 'test', ok: true })));

    const callback = jest.fn();
    runner.transform(call as any).catch(callback);
    await jest.advanceTimersByTimeAsync(delay);
    expect(callback).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(delay);
    expect(callback).toHaveBeenCalledWith(expect.objectContaining({}));
    expect(condition).toHaveBeenCalledTimes(2);
  });

  it('should retry on not ok call', async () => {
    const condition = jest.fn().mockReturnValue(true);
    const plugin = new RetryFetch(3, condition);
    const runners: any[] = [];

    const runner = plugin.load({ url: 'not an url', fetchPlugins: runners } as any);
    runners.push(runner);
    const call = Promise.resolve({ text: 'test', ok: false });

    const callback = jest.fn();
    runner.transform(call as any).catch(callback);
    await jest.runAllTimersAsync();
    expect(callback).toHaveBeenCalledWith(expect.objectContaining({}));
    expect(condition).toHaveBeenCalledTimes(3);
  });

  it('should retry on not ok call with wait', async () => {
    const condition = jest.fn().mockReturnValue(true);
    const delay = 500;
    const plugin = new RetryFetch(3, condition, () => delay);
    const runners: any[] = [];

    const runner = plugin.load({ url: 'not an url', fetchPlugins: runners } as any);
    runners.push(runner);
    const call = Promise.resolve({ text: 'test', ok: false });

    const callback = jest.fn();
    runner.transform(call as any).catch(callback);
    await jest.advanceTimersByTimeAsync(2 * delay);
    expect(callback).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(delay);
    expect(callback).toHaveBeenCalledWith(expect.objectContaining({}));
    expect(condition).toHaveBeenCalledTimes(3);
  });
});
