import {
  ConcurrentFetch
} from './concurrent.fetch';

describe('Concurrent Fetch Plugin', () => {
  it('should start if the limit is not reach', async () => {
    const plugin = new ConcurrentFetch(3);

    plugin.load({} as any);
    const runner = plugin.load({} as any);
    const canStart = await runner.canStart();

    expect(canStart).toBe(true);
  });

  it('should retrieve the fetchcall in the pool', () => {
    const plugin = new ConcurrentFetch(3);
    const call = new Promise<any>((resolve) => setTimeout(() => resolve(undefined), 1000));
    const test = new Promise<any>((resolve) => setTimeout(() => resolve(undefined), 1000));

    void plugin.load({} as any).transform(call);
    void plugin.load({} as any).transform(call);
    void plugin.load({} as any).transform(test);

    expect(plugin.pool[2]).toBe(test);
  });

  it('should start only when the pool is available', async () => {
    const plugin = new ConcurrentFetch(2);
    const resolves: [any, any] = [null, null];

    const call0: any = new Promise<any>((resolve) => resolves[0] = resolve);
    const call1: any = new Promise<any>((resolve) => resolves[1] = resolve);
    const result = { res: false };

    void plugin.load({} as any).transform(call0);
    const runner1 = plugin.load({} as any);
    const canStart1 = runner1.canStart();
    await jest.runAllTimersAsync();

    expect(await canStart1).toBe(true);
    void runner1.transform(call1);

    const runner2 = plugin.load({} as any);
    const pCanStart2 = runner2.canStart();
    await jest.runAllTimersAsync();

    expect((plugin as any).waitingResolvers.length).toBe(1);

    result.res = true;

    resolves[0]();

    expect(await pCanStart2).toBe(true);

    resolves[1]();

    await jest.advanceTimersByTimeAsync(500);

    expect((plugin as any).waitingResolvers.length).toBe(0);
  });
});
