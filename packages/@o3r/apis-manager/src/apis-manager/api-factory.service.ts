import { Api, ApiClient, ApiName } from '@ama-sdk/core';
import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { ApiManager } from './api-manager';
import { INTERNAL_API_TOKEN } from './api-manager.token';

/** Type of the Class of an SDK Api */
export type ApiClassType<T extends Api = Api> = (new (client: ApiClient) => T) & ApiName;

/**
 * Initial APIs instantiations
 */
export const INITIAL_APIS_TOKEN = new InjectionToken<(Api | ApiClassType)[]>('Initial APIs token');

@Injectable()
export class ApiFactoryService {

  /** Map of loaded APIs */
  private loadedApis: Record<string, Api> = {};

  constructor(@Inject(INTERNAL_API_TOKEN) private apiManager: ApiManager, @Optional() @Inject(INITIAL_APIS_TOKEN) apis?: (Api | ApiClassType)[]) {
    if (apis) {
      this.updateApiMapping(apis);
    }
  }

  /**
   * Determine if the given parameter is a API class
   *
   * @param apiClass object to check
   */
  private isApiClass<T extends Api = Api>(apiClass: any): apiClass is ApiClassType<T> {
    return !!apiClass.apiName && typeof apiClass === 'function';
  }

  /**
   * Retrieve a specific API with loaded configuration
   *
   * @param apiClass class of the API to retrieve
   * @param refreshCache Ignore cached API instance and refresh it
   */
  public getApi<T extends Api>(apiClass: (new (client: ApiClient) => T) & ApiName, refreshCache = false): T {
    const cache = this.loadedApis[apiClass.apiName];
    if (!refreshCache && cache) {
      return cache as T;
    }

    // eslint-disable-next-line new-cap
    const instance = new apiClass(this.getConfigFor(apiClass));
    this.loadedApis[apiClass.apiName] = instance;
    return instance;
  }

  /**
   * Update the Map of loaded APIs.
   * Note: Can be used to override the a specific API
   *
   * @param map Map of loaded APIs to update
   */
  public updateApiMapping(map: (Api | ApiClassType)[] | Record<string, (Api | ApiClassType)>) {
    const newItems = Array.isArray(map) ? map
      .reduce((acc, curr) => {
        acc[curr.apiName] = curr;
        return acc;
      }, {}) : map;

    this.loadedApis = {
      ...this.loadedApis,
      ...Object.entries(newItems)
        .reduce<Record<string, Api>>((acc, [apiName, api]) => {
          // eslint-disable-next-line new-cap
          acc[apiName] = this.isApiClass(api) ? new api(this.getConfigFor(api)) : api;
          return acc;
        }, {})
    };
  }

  /**
   * Clear the cache of loaded APIs
   *
   * @param apis Whitelist of APIs to clear from the cache, if specified only these apis will be removed from the cache
   */
  public clearCache(apis?: ApiName[]) {
    if (apis) {
      apis.forEach((api) => delete this.loadedApis[api.apiName]);
    } else {
      this.loadedApis = {};
    }
  }

  /**
   * Retrieve the configuration for a specific API
   *
   * @param apiClass class of the API for which retrieving the configuration
   */
  public getConfigFor(apiClass: ApiName): ApiClient {
    return this.apiManager.getConfiguration(apiClass.apiName);
  }
}
