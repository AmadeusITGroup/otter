import { PluginRunner, RequestOptions, RequestPlugin } from '../core';

/**
 * Plugin to change the request url
 */
export class UrlRewriteRequest implements RequestPlugin {

  private readonly urlRewriter: (url: string) => string | Promise<string>;

  /**
   * Initialize your plugin
   * @param urlRewriter Callback to modify the URL
   */
  constructor(urlRewriter: (url: string) => string | Promise<string>) {
    this.urlRewriter = urlRewriter;
  }

  public load(): PluginRunner<RequestOptions, RequestOptions> {
    return {
      transform: async (data: RequestOptions) => {
        data.basePath = await this.urlRewriter(data.basePath);
        return data;
      }
    };
  }

}
