import { ModuleWithProviders, NgModule, Optional } from '@angular/core';
import { ApiFactoryService } from './api-factory.service';
import { ApiManager } from './api-manager';
import { API_TOKEN, INTERNAL_API_TOKEN } from './api-manager.token';


/**
 * Generate a default API manager
 *
 * @param config
 */
export function defaultConfig(config: ApiManager): ApiManager {
  return config;
}

// Module that needs to be imported by the application to instantiate an SDK configuration.
@NgModule({
  providers: [
    { provide: INTERNAL_API_TOKEN, useFactory: defaultConfig, deps: [[new Optional(), API_TOKEN]]},
    ApiFactoryService
  ]
})
export class ApiManagerModule {
  /**
   * Provide a custom apiManager
   * A factory can be provided via injection to the token API_TOKEN
   *
   * @param apiManager
   */
  public static forRoot(apiManager: ApiManager): ModuleWithProviders<ApiManagerModule> {
    return {
      ngModule: ApiManagerModule,
      providers: [
        { provide: API_TOKEN, useValue: apiManager }
      ]
    };
  }
}
