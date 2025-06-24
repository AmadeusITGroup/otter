import {
  PluginAsyncRunner,
} from '@ama-sdk/core';
import type {
  FetchCall,
  FetchPluginContext,
} from '../../fetch-plugin';
import {
  RedirectIfFailedFetch,
} from './redirect-if-failed.fetch';

describe('RedirectIfFailedFetch', () => {
  const fallbackUrl = 'https://fallback.com';
  let plugin: RedirectIfFailedFetch;
  let context: FetchPluginContext;
  let fetchMock: jest.SpyInstance;

  beforeEach(() => {
    plugin = new RedirectIfFailedFetch(fallbackUrl);

    context = {
      url: 'https://original.com',
      fetchPlugins: []
    } as unknown as FetchPluginContext;

    fetchMock = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should set fallbackUrl from constructor', () => {
    expect(plugin.fallbackUrl).toBe(fallbackUrl);
  });

  it('should return result if fetchCall resolves with ok=true', async () => {
    const response = { ok: true } as Response;
    const fetchCall = Promise.resolve(response) as FetchCall;
    const runners: any[] = [];
    const runner = plugin.load(context);
    runners.push(runner);
    context.fetchPlugins = runners;

    const result = await runner.transform(fetchCall);

    expect(result).toBe(response);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should redirect if fetchCall resolves with ok=false', async () => {
    const response = { ok: false } as Response;
    const fetchCall = Promise.resolve(response) as FetchCall;

    const fallbackResponse = { ok: true } as Response;
    fetchMock.mockResolvedValue(fallbackResponse);

    const runners: any[] = [];
    const runner = plugin.load(context);
    runners.push(runner);
    context.fetchPlugins = runners;

    const result = await runner.transform(fetchCall);

    expect(fetchMock).toHaveBeenCalledWith(fallbackUrl, { headers: undefined });
    expect(result).toBe(fallbackResponse);
    expect(context.url).toBe(fallbackUrl);
  });

  it('should redirect if originFetchCall resolves with ok=false and it should do only one call to fallbackUrl even if this resolves with ok=false', async () => {
    context.url = 'originUrl';
    const originResponse = { ok: false } as Response;
    const originFetchCall = Promise.resolve(originResponse) as FetchCall;

    const runners: any[] = [];
    const runner = plugin.load(context);
    runners.push(runner);
    context.fetchPlugins = runners;

    const fallbackResponse = { ok: false } as Response;
    fetchMock.mockResolvedValue(fallbackResponse);

    const result = await runner.transform(originFetchCall);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(fallbackUrl, { headers: undefined });
    expect(result).toBe(fallbackResponse);
  });

  it('should redirect if fetchCall rejects', async () => {
    const fetchCall = Promise.reject(new Error('fail')) as FetchCall;
    const { transform } = plugin.load(context);

    const fallbackResponse = { ok: true } as Response;
    fetchMock.mockResolvedValue(fallbackResponse);

    const result = await transform(fetchCall);

    expect(fetchMock).toHaveBeenCalledWith(fallbackUrl, { headers: undefined });
    expect(result).toBe(fallbackResponse);
    expect(context.url).toBe(fallbackUrl);
  });

  it('should throw if origin call fails and fallback call fails too', async () => {
    context.url = 'originUrl';
    const errorOriginalCall = new Error('fail');
    const errorFallbackCall = new Error('Redirection loop detected: https://fallback.com already visited.');
    const fetchCall = Promise.reject(errorOriginalCall) as FetchCall;

    const runners: any[] = [];
    const runner = plugin.load(context);
    runners.push(runner);
    context.fetchPlugins = runners;

    fetchMock.mockImplementation(() => Promise.reject(new Error('fail on fallback call')));

    await expect(runner.transform(fetchCall)).rejects.toThrow(errorFallbackCall);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should call all fallback urls and throw if origin call fails and all fallback calls fail too', async () => {
    context.url = 'originUrl';
    const errorOriginalCall = new Error('fail');
    const errorFallbackSecondCall = new Error('Redirection loop detected: http://second-fallback-url.com already visited.');
    const fetchCall = Promise.reject(errorOriginalCall) as FetchCall;

    const runners: any[] = [];
    const runner = plugin.load(context);
    const plugin2 = new RedirectIfFailedFetch('http://second-fallback-url.com');
    const runner2 = plugin2.load(context);

    const plugin3 = new RedirectIfFailedFetch('http://second-fallback-url.com');
    const runner3 = plugin3.load(context);
    runners.push(runner, runner2, runner3);
    context.fetchPlugins = runners;

    fetchMock.mockImplementation(() => Promise.reject(new Error('fail on fallback call')));
    await expect(runner.transform(fetchCall)).rejects.toThrow(errorFallbackSecondCall);
    expect(fetchMock).toHaveBeenCalledTimes(3); // one for each fallback call (even if same fallback url for 2 instances of plugin)
  });

  it('should avoid an infinite loop if plugin loaded multiple times', async () => {
    context.url = 'originUrl';
    const originResponse = { ok: false } as Response;
    const originFetchCall = Promise.resolve(originResponse) as FetchCall;

    const fallbackResponse = { ok: false } as Response;
    fetchMock.mockResolvedValue(fallbackResponse);

    const runners: any[] = [];
    const runner = plugin.load(context);

    const plugin2 = new RedirectIfFailedFetch('http://second-fallback-url.com');
    const runner2 = plugin2.load(context);

    const plugin3 = new RedirectIfFailedFetch('http://second-fallback-url.com');
    const runner3 = plugin3.load(context);

    runners.push(runner, runner2, runner3);
    context.fetchPlugins = runners;
    await runner.transform(originFetchCall);

    expect(fetchMock).toHaveBeenCalledTimes(3); // once for each plugin
  });

  it('should apply fetchPlugins on redirect', async () => {
    const response = { ok: false } as Response;
    const fetchCall = Promise.resolve(response) as FetchCall;

    const fallbackResponse = { ok: true } as Response;
    fetchMock.mockResolvedValue(fallbackResponse);

    const pluginTransform = jest.fn().mockImplementation(async (call: Promise<Response>) => {
      const res = await call;
      return { ...res, transformed: true };
    });
    const fakePlugin = {
      transform: pluginTransform,
      load: () => ({})
    } as unknown as PluginAsyncRunner<Response, FetchCall>;
    context.fetchPlugins = [fakePlugin];

    const { transform } = plugin.load(context);
    const result = await transform(fetchCall);

    expect(pluginTransform).toHaveBeenCalled();
    expect(result).toEqual(expect.objectContaining({ ok: true, transformed: true }));
  });
});
