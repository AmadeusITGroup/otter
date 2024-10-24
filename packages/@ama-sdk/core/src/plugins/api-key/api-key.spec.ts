import {
  RequestOptions
} from '../core/request-plugin';
import {
  ApiKeyRequest
} from './api-key.request';

describe('Api Key Request Plugin', () => {
  let options: RequestOptions;

  beforeEach(() => {
    const headers = new Headers();
    jest.spyOn(headers, 'append');

    options = { headers, basePath: 'http://test.com/truc', method: 'get' };
  });

  it('should add the API Key to the headers', async () => {
    const plugin = new ApiKeyRequest('test', 'testKey');
    const runner = plugin.load();

    await runner.transform(options);

    // eslint-disable-next-line @typescript-eslint/unbound-method -- method is not called here, we use reference for the spy
    expect(options.headers.append).toHaveBeenCalledWith('testKey', 'test');
  });

  it('should execute the function to add the API Key to the headers', async () => {
    const plugin = new ApiKeyRequest(() => Promise.resolve('test'), 'testKey');
    const runner = plugin.load();

    await runner.transform(options);

    // eslint-disable-next-line @typescript-eslint/unbound-method -- method is not called here, we use reference for the spy
    expect(options.headers.append).toHaveBeenCalledWith('testKey', 'test');
  });
});
