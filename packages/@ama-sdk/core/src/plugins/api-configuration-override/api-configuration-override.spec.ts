import { RequestOptions } from '../core/request-plugin';
import { ApiConfigurationOverride } from './api-configuration-override.request';

describe('ApiConfigurationOverride Plugin', () => {

  let options: RequestOptions;

  class FakeHeader {
    private readonly items = new Map();

    public get = (a) => this.items.get(a);
    public has = (a) => this.items.has(a);
    public append = (a, b) => this.items.set(a, b);
  }

  beforeEach(() => {
    options = {
      method: 'get',
      headers: new FakeHeader() as any,
      basePath: 'http://test.com/api'
    };
  });

  it('should add a specified string JWS', async () => {
    const plugin = new ApiConfigurationOverride('fakeJWS');
    const runner = plugin.load();

    const result = await runner.transform(options);

    expect(result.headers.get('ama-client-facts')).toBe('fakeJWS');
  });

  it('should add a specified string JWS with a custom header name', async () => {
    const plugin = new ApiConfigurationOverride('fakeJWS', 'my-header');
    const runner = plugin.load();

    const result = await runner.transform(options);

    expect(result.headers.get('my-header')).toBe('fakeJWS');
  });

  it('should add a specified dynamic JWS', async () => {
    let counter = 0;
    const dynamicJws = () => Promise.resolve('dynamicJWS' + counter.toString());
    const plugin = new ApiConfigurationOverride(dynamicJws);
    let runner = plugin.load();

    let result = await runner.transform(options);

    expect(result.headers.get('ama-client-facts')).toBe('dynamicJWS0');
    counter++;

    runner = plugin.load();
    result = await runner.transform(options);
    expect(result.headers.get('ama-client-facts')).toContain('dynamicJWS1');
  });
});
