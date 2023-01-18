import { ApiClient, ApiFetchClient } from '@dapi/sdk-core';

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
   *
   * @warning This should not be used to get the ApiClient for an API, the function getConfiguration() should be used instead
   */
  public get registeredApiConfigurations() {
    return {...this.apiConfigurations} as const;
  }

  /**
   * Create an API manager using a custom ApiClient
   *
   * @param defaultConfiguration
   */
  constructor(defaultConfiguration: ApiClient = new ApiFetchClient(), apiConfigurations: { [key: string]: ApiClient } = {}) {
    this.defaultConfiguration = defaultConfiguration;
    this.apiConfigurations = apiConfigurations;
  }

  /**
   * Retrieve a configuration for a specific API
   *
   * @param api API to get the configuration for
   */
  public getConfiguration(api?: string): ApiClient {
    return api && this.apiConfigurations[api] || this.defaultConfiguration;
  }

  /**
   * Set or override API configuration
   *
   * @param apiClient API configuration to override to the given api
   * @param api API name to override, the default configuration will be used if not specified
   */
  public setConfiguration(apiClient: ApiClient, api?: string): void {
    if (api) {
      this.apiConfigurations[api] = apiClient;
    } else {
      this.defaultConfiguration = apiClient;
    }
  }
}
