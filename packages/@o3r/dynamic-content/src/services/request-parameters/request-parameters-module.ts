import {
  makeEnvironmentProviders,
} from '@angular/core';
import {
  RequestParametersConfig,
} from './request-parameters-config';
import {
  RequestParametersService,
} from './request-parameters-service';
import {
  REQUEST_PARAMETERS_CONFIG_TOKEN,
} from './request-parameters-token';

/**
 * Empty configuration factory, used when config is not provided. It needs a separate function for AOT.
 */
export function defaultConfigFactory() {
  return {};
}

/**
 * Provide request parameters config
 * We don't provide directly the value and use a factory because otherwise AOT compilation will resolve to undefined whatever is taken from window
 * @param config
 */
export function provideRequestParameters(config: () => Partial<RequestParametersConfig> = defaultConfigFactory) {
  return makeEnvironmentProviders([
    {
      provide: REQUEST_PARAMETERS_CONFIG_TOKEN,
      useFactory: config
    },
    RequestParametersService
  ]);
}
