import {
  RequestOptions
} from '../core/request-plugin';
import {
  FetchCredentialsRequest
} from './fetch-credentials.request';

describe('Fetch API credentials Request Plugin', () => {
  const options: RequestOptions = { headers: new Headers(), basePath: 'http://test.com/truc', method: 'get' };

  it('credentials should be set to same-origin by default', async () => {
    const plugin = new FetchCredentialsRequest();
    const runner = plugin.load();

    await runner.transform(options);
    const cred = (await plugin.load().transform(options)).credentials;

    expect(cred).toBe('same-origin');
  });

  it('credentials should be set correctly', async () => {
    const plugin = new FetchCredentialsRequest('include');
    const runner = plugin.load();

    await runner.transform(options);
    const cred = (await plugin.load().transform(options)).credentials;

    expect(cred).toBe('include');
  });
});
