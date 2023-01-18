import { PluginRunner, RequestOptions, RequestPlugin } from '../core';

/**
 * Authorized fetch options for this plugin
 */
export interface AuthorizedFetchOptions {
  cache: RequestCache;
  credentials: RequestCredentials;
}

/**
 * Plugin to set the options of the fetch API for every request it is applied to.
 *
 * @deprecated Use fetch-cache and fetch-credential plugins instead, will be removed in v10
 */
export class FetchOptionsRequest implements RequestPlugin {

  /**
   * Value that will be set as the options of the fetch API.
   */
  private fetchOptions: AuthorizedFetchOptions;

  /**
   * Default fetch options
   */
  private defaultFetchOptions: AuthorizedFetchOptions = {cache: 'no-cache', credentials: 'same-origin'};

  constructor(fetchOptions?: Partial<AuthorizedFetchOptions>) {
    this.fetchOptions = {...this.defaultFetchOptions, ...(fetchOptions ? fetchOptions : {})};
  }

  public load(): PluginRunner<RequestOptions, RequestOptions> {
    return {
      transform: (data: RequestOptions) => {
        return {...data, ...this.fetchOptions};
      }
    };
  }
}
