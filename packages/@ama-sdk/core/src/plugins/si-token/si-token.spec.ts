import {
  RequestOptions,
} from '../core/request-plugin';
import {
  SiTokenRequest,
} from './si-token.request';

describe('SI Token Request Plugin', () => {
  const defaultGetParams = { defaultTest: 'ok' };
  const defaultBody = 'default';
  let options: RequestOptions;

  beforeEach(() => {
    options = {
      method: 'get',
      queryParams: defaultGetParams,
      headers: new Headers(),
      body: defaultBody,
      basePath: 'http://test.com/truc'
    };
  });

  it('should add a specified SI Tokens in query params', async () => {
    const plugin = new SiTokenRequest('SIToken1', 'SIToken2');
    const runner = plugin.load();

    const result = await runner.transform(options);

    expect(result.queryParams.SITK).toBe('SIToken1');
    expect(result.queryParams.SITK2).toBe('SIToken2');
  });
});
