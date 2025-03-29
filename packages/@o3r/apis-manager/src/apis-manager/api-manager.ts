import type {
  ApiClient,
  ApiName,
} from '@ama-sdk/core';

/**
 * Api manager is responsible to provide an api configuration to a service factory, so that it could instantiate an API
 * with the right parameters. It contains a default configuration and a map of specific configurations for API / set of
 * API. Configurations are only exposed through the method getConfiguration, which will merge the default configuration
 * and the requested one.
 */
export class ApiManager {
  private defaultConfiguration: ApiClient;
  private apiConfigurations: { [key: string]: ApiClient };

  /**
   * Map of registered Api Client associated to specific API
   * Warning: This should not be used to get the ApiClient for an API, the function getConfiguration() should be used instead
   */
  public get registeredApiConfigurations() {
    return { ...this.apiConfigurations } as const;
  }

  /**
   * Create an API manager using a custom ApiClient
   * @param defaultConfiguration
   */
  constructor(defaultConfiguration: ApiClient, apiConfigurations: { [key: string]: ApiClient } = {}) {
    this.defaultConfiguration = defaultConfiguration;
    this.apiConfigurations = apiConfigurations;
  }

  /**
   * Retrieve a configuration for a specific API
   * @param api API to get the configuration for
   * @note When passing a string the configuration is expecting to exist else an error is thrown
   * @note when passing an Api instance that does not match a registered configuration, the default one will be returned
   */
  public getConfiguration(api?: string | ApiName): ApiClient {
    if (typeof api === 'string') {
      if (this.apiConfigurations[api]) {
        return this.apiConfigurations[api];
      } else {
        throw new Error(`Unknown API configuration: ${api}\nKnown API configurations: ${Object.keys(this.apiConfigurations).join(', ')}`);
      }
    }
    return (api && this.apiConfigurations[api.apiName]) || this.defaultConfiguration;
  }

  /**
   * Set or override API configuration
   * @param apiClient API configuration to override to the given api
   * @param api API name to override, the default configuration will be used if not specified
   */
  public setConfiguration(apiClient: ApiClient, api?: string | ApiName): void {
    if (api) {
      this.apiConfigurations[typeof api === 'string' ? api : api.apiName] = apiClient;
    } else {
      this.defaultConfiguration = apiClient;
    }
  }
}
