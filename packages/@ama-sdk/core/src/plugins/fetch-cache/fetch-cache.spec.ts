import {RequestOptions} from '../core/request-plugin';
import { FetchCacheRequest} from './fetch-cache.request';

describe('Fetch API cache Request Plugin', () => {

  let globalFetchBackup: any;

  beforeEach(() => {
    globalFetchBackup = fetch;
  });

  afterEach(() => {
    (global as any).fetch = globalFetchBackup;
  });

  it('cache should be set correctly', async () => {
    const options: RequestOptions = {headers: new Headers(), basePath: 'http://test.com/truc', method: 'get'};
    const plugin = new FetchCacheRequest('force-cache');
    const cache = (await plugin.load().transform(options)).cache;

    expect(cache).toBe('force-cache');
  });

  it('should set Cache-Control and Pragma header to no-cache in the request', async () => {
    const options: RequestOptions = {headers: new Headers(), basePath: 'http://test.com/truc', method: 'get'};
    (global as any).fetch = {polyfill: true};
    const plugin = new FetchCacheRequest('force-cache', 'no-cache');
    const headerCacheControl = (await plugin.load().transform(options)).headers.get('Cache-Control');
    const headerPragma = (await plugin.load().transform(options)).headers.get('Pragma');

    expect(headerCacheControl).toEqual('no-cache');
    expect(headerPragma).toEqual('no-cache');
  });

  it('should not set Cache-Control header in the request', async () => {
    const options: RequestOptions = { headers: new Headers(), basePath: 'http://test.com/truc', method: 'get' };
    (global as any).fetch = () => {};
    const plugin = new FetchCacheRequest('force-cache', 'no-cache');
    const headerCacheControl = (await plugin.load().transform(options)).headers.get('Cache-Control');
    const headerPragma = (await plugin.load().transform(options)).headers.get('Pragma');

    expect(headerCacheControl).toBeNull();
    expect(headerPragma).toBeNull();
  });
});
