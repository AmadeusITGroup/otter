import { PluginRunner, RequestOptions, RequestPlugin } from '../core';
/**
 * Plugin to set the cache option of the fetch API for every request it is applied to.
 *
 * For older browsers relying on a polyfill that do not support the fetch 'cache' option, you can:
 *  - specify the content of the 'cache-control' header, that will add a 'pragma' header too in case of 'no-cache'
 *  - specify if the plug-in should add those headers or not. Defaults to checking the presence of the 'whatwg-fetch' polyfill.
 *
 *  IMPORTANT: When using this plug-in in an Angular application, Zone overrides the global 'fetch' function that makes the default
 *  check obsolete. In that case it's recommended to pass your own condition via the constructor.
 */
export class FetchCacheRequest implements RequestPlugin {

  /**
   * Value that will be set as the options of the fetch API.
   */
  private readonly fetchCache?: RequestCache;

  /**
   * Value that will be set in the request header to drive the cache management in older browser such as IE11.
   */
  private readonly cacheControl?: string;

  /**
   * Should the plugin add additional cache headers for instance for IE11 compatibility.
   */
  private readonly shouldAddCacheControlHeaders: boolean;

  constructor(fetchCache?: RequestCache, cacheControl?: string, shouldAddCacheControlHeaders?: boolean) {
    this.fetchCache = fetchCache;
    this.cacheControl = cacheControl;
    this.shouldAddCacheControlHeaders = typeof shouldAddCacheControlHeaders !== 'undefined'
      ? shouldAddCacheControlHeaders
      : (typeof fetch === 'undefined' || (fetch as any).polyfill);
  }

  public load(): PluginRunner<RequestOptions, RequestOptions> {
    return {
      transform: (data: RequestOptions) => {
        if (this.cacheControl && this.shouldAddCacheControlHeaders) {
          data.headers.set('Cache-Control', `${this.cacheControl}`);
          if (this.cacheControl === 'no-cache') {
            data.headers.set('Pragma', 'no-cache');
          }
        }
        return {...data, cache: this.fetchCache};
      }
    };
  }
}
