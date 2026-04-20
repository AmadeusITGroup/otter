import {
  makeEnvironmentProviders,
} from '@angular/core';
import {
  ApiFactoryService,
} from './api-factory-service';
import {
  ApiManager,
} from './api-manager';
import {
  API_TOKEN,
} from './api-manager-token';

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
