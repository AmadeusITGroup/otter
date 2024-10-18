import {
  RequestOptions
} from '../core/request-plugin';
import {
  UrlRewriteRequest
} from './url-rewrite.request';

describe('URL Rewrite Request Plugin', () => {
  const urlRewriter = jest.fn().mockReturnValue('http://ok');

  const defaultGetParams = { defaultTest: 'ok' };
  const defaultBody = 'default';
  const defaultUrl = 'http://test.com/truc';
  let options: RequestOptions;

  beforeEach(() => {
    options = {
      method: 'get',
      queryParams: defaultGetParams,
      headers: new Headers(),
      body: defaultBody,
      basePath: defaultUrl
    };
  });

  it('should call the URL rewriter', async () => {
    const plugin = new UrlRewriteRequest(urlRewriter);
    const runner = plugin.load();

    await runner.transform(options);

    expect(urlRewriter).toHaveBeenCalledWith(defaultUrl);
  });

  it('should have updated the url', async () => {
    const plugin = new UrlRewriteRequest(urlRewriter);
    const runner = plugin.load();

    const result = await runner.transform(options);

    expect(result.basePath).toBe('http://ok');
  });
});
