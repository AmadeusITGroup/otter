import {
  AbortFetch
} from './abort.fetch';

describe('Abort Plugin', () => {
  it('should trigger the callback', async () => {
    const fn = jest.fn();
    const plugin = new AbortFetch(fn);

    const runner = plugin.load({} as any);
    await runner.transform(Promise.resolve() as Promise<any>);

    expect(fn).toHaveBeenCalled();
  });

  it('should trigger abort signal if true', async () => {
    const defaultContext = {
      controller: {
        abort: jest.fn()
      }
    };
    const fn = jest.fn().mockResolvedValue(true);
    const plugin = new AbortFetch(fn);

    const runner = plugin.load(defaultContext as any);
    await runner.transform(Promise.resolve() as Promise<any>);

    expect(defaultContext.controller.abort).toHaveBeenCalled();
  });

  it('should not trigger abort signal if false', async () => {
    const defaultContext = {
      controller: {
        abort: jest.fn()
      }
    };
    const fn = jest.fn().mockResolvedValue(false);
    const plugin = new AbortFetch(fn);

    const runner = plugin.load(defaultContext as any);
    await runner.transform(Promise.resolve() as Promise<any>);

    expect(defaultContext.controller.abort).not.toHaveBeenCalled();
  });
});
