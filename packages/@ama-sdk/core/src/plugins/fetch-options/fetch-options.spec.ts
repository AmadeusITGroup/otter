import {RequestOptions} from '../core/request-plugin';
import {FetchOptionsRequest} from './fetch-options.request';

describe('Fetch API cache Request Plugin', () => {
  const options: RequestOptions = {headers: new Headers(), basePath: 'http://test.com/truc'};

  it('cache should be set to no-cache by default', async () => {
    const plugin = new FetchOptionsRequest();
    const runner = plugin.load();

    await runner.transform(options);
    const cache = (await plugin.load().transform(options)).cache;

    expect(cache).toBe('no-cache');
  });

  it('credentials should be set to same-origin by default', async () => {
    const plugin = new FetchOptionsRequest();
    const runner = plugin.load();

    await runner.transform(options);
    const credentials = (await plugin.load().transform(options)).credentials;

    expect(credentials).toBe('same-origin');
  });

  it('cache should be set correctly', async () => {
    const plugin = new FetchOptionsRequest({cache: 'force-cache'});
    const runner = plugin.load();

    await runner.transform(options);
    const cache = (await plugin.load().transform(options)).cache;

    expect(cache).toBe('force-cache');
  });

  it('credentials should be set correctly', async () => {
    const plugin = new FetchOptionsRequest({credentials: 'include'});
    const runner = plugin.load();

    await runner.transform(options);
    const credentials = (await plugin.load().transform(options)).credentials;

    expect(credentials).toBe('include');
  });

  it('cache and credentials should be set correctly', async () => {
    const plugin = new FetchOptionsRequest({cache: 'force-cache', credentials: 'include'});
    const runner = plugin.load();

    await runner.transform(options);
    const cache = (await plugin.load().transform(options)).cache;

    expect(cache).toBe('force-cache');
    const credentials = (await plugin.load().transform(options)).credentials;

    expect(credentials).toBe('include');
  });
});
