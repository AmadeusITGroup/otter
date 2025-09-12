import {
  makeEnvironmentProviders,
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
import {
  ApiFactoryService,
} from './api-factory.service';
import {
  ApiManager,
} from './api-manager';
import {
  API_TOKEN,
} from './api-manager.token';

/**
 * Module that needs to be imported by the application to instantiate an SDK configuration.
 */
@NgModule({
  providers: [
    ApiFactoryService
  ]
})
export class ApiManagerModule {
  /**
   * Provide a custom {@link ApiManager}
   * A factory can be provided via injection to the token {@link API_TOKEN}
   * @param apiManager
   * @deprecated Please use {@link provideApiManager} instead, will be removed in v14.
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

/**
 * Provide a custom {@link ApiManager}
 * A factory can be provided via injection to the token {@link API_TOKEN}
 * @param apiManager
 */
export function provideApiManager(apiManager: ApiManager) {
  return makeEnvironmentProviders([
    ApiFactoryService,
    { provide: API_TOKEN, useValue: apiManager }
  ]);
}
