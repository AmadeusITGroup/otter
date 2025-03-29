import type {
  Api,
  ApiClient,
  ApiName,
} from '@ama-sdk/core';
import {
  Inject,
  Injectable,
  InjectionToken,
  Optional,
} from '@angular/core';
import {
  ApiManager,
} from './api-manager';
import {
  API_TOKEN,
} from './api-manager.token';

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

  constructor(@Inject(API_TOKEN) private readonly apiManager: ApiManager, @Optional() @Inject(INITIAL_APIS_TOKEN) apis?: (Api | ApiClassType)[]) {
    if (apis) {
      this.updateApiMapping(apis);
    }
  }

  /**
   * Determine if the given parameter is a API class
   * @param apiClass object to check
   */
  private isApiClass<T extends Api = Api>(apiClass: any): apiClass is ApiClassType<T> {
    return !!apiClass.apiName && typeof apiClass === 'function';
  }

  /**
   * Retrieve a specific API with loaded configuration
   * @param apiClass class of the API to retrieve
   * @param refreshCache Ignore cached API instance and refresh it
   * @param customApiName override the `apiName` set in the `apiClass`
   * @note When passing `customApiName` the configuration is expecting to exist else an error is thrown
   * @note When passing an Api instance that does not match a registered configuration without `customApiName`, the default one will be returned
   */
  public getApi<T extends Api>(apiClass: (new (client: ApiClient) => T) & ApiName, refreshCache = false, customApiName?: string): T {
    const apiName = customApiName ?? apiClass.apiName;
    const cache = this.loadedApis[apiName];
    if (!refreshCache && cache) {
      return cache as T;
    }

    const instance = new apiClass(this.getConfigFor(customApiName ?? apiClass));
    this.loadedApis[apiName] = instance;
    return instance;
  }

  /**
   * Update the Map of loaded APIs.
   * Note: Can be used to override the a specific API
   * @param map Map of loaded APIs to update
   */
  public updateApiMapping(map: (Api | ApiClassType)[] | Record<string, (Api | ApiClassType)>) {
    const newItems: Record<string, (Api | ApiClassType)> = Array.isArray(map)
      ? map
        .reduce<Record<string, Api | ApiClassType<Api>>>((acc, curr) => {
          acc[curr.apiName] = curr;
          return acc;
        }, {})
      : map;

    this.loadedApis = {
      ...this.loadedApis,
      ...Object.entries(newItems)
        .reduce<Record<string, Api>>((acc, [apiName, api]) => {
          acc[apiName] = this.isApiClass(api) ? new api(this.getConfigFor(api)) : api;
          return acc;
        }, {})
    };
  }

  /**
   * Clear the cache of loaded APIs
   * @param apis Whitelist of APIs to clear from the cache, if specified only these apis will be removed from the cache
   */
  public clearCache(apis?: (ApiName | string)[]) {
    if (apis) {
      apis.forEach((api) => delete this.loadedApis[typeof api === 'string' ? api : api.apiName]);
    } else {
      this.loadedApis = {};
    }
  }

  /**
   * Retrieve the configuration for a specific API
   * @param api API for which retrieving the configuration
   */
  public getConfigFor(api: string | ApiName): ApiClient {
    return this.apiManager.getConfiguration(api);
  }
}
