import {
  WaitForFetch
} from './wait-for.fetch';

describe('Wait For Fetch Plugin', () => {
  const defaultContext: any = {};

  it('should not start if timeout', async () => {
    const plugin = new WaitForFetch(() => ({ result: new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 2000)) }), 100);

    const runner = plugin.load(defaultContext);
    const canStart = runner.canStart();
    await jest.runAllTimersAsync();

    expect(await canStart).toBe(false);
  });

  it('should start if promise condition passed', async () => {
    const plugin = new WaitForFetch(() => ({ result: Promise.resolve(true) }), 100);

    const runner = plugin.load(defaultContext);
    const canStart = await runner.canStart();

    expect(canStart).toBe(true);
  });

  it('should start if condition passed', async () => {
    const plugin = new WaitForFetch(() => ({ result: true }), 100);

    const runner = plugin.load(defaultContext);
    const canStart = await runner.canStart();

    expect(canStart).toBe(true);
  });

  it('should call the callback function on success', async () => {
    const callback = jest.fn();
    const plugin = new WaitForFetch(() => ({ result: true }), 100, callback);

    const runner = plugin.load(defaultContext);
    const response: any = { test: true };
    const fetchCall = Promise.resolve(response);
    await runner.transform(fetchCall);

    expect(callback).toHaveBeenCalledWith(expect.objectContaining(defaultContext), fetchCall, response);
  });

  it('should call the callback function with the correct data', async () => {
    const callback = jest.fn();
    const plugin = new WaitForFetch(() => ({ result: true, data: 'test' }), 100, callback);

    const runner = plugin.load(defaultContext);
    const response: any = { test: true };
    const fetchCall = Promise.resolve(response);
    await runner.canStart();
    await runner.transform(fetchCall);

    expect(callback).toHaveBeenCalledWith(expect.objectContaining({ ...defaultContext, data: 'test' }), fetchCall, response);
  });

  it('should call the callback function on failure', async () => {
    const callback = jest.fn();
    const plugin = new WaitForFetch(() => ({ result: true }), 100, callback);

    const runner = plugin.load(defaultContext);
    const response: any = { test: true };
    const fetchCall = Promise.reject(response);
    try {
      await runner.transform(fetchCall);
    } catch {}

    expect(callback).toHaveBeenCalledWith(expect.objectContaining(defaultContext), fetchCall, undefined);
  });
});
