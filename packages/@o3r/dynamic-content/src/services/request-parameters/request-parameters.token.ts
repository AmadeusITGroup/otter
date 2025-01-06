import {
  InjectionToken,
} from '@angular/core';
import {
  RequestParametersConfig,
} from './request-parameters.config';

/**
 * Token to be provided in case of service customization needs.
 */
export const REQUEST_PARAMETERS_CONFIG_TOKEN = new InjectionToken<Partial<RequestParametersConfig>>('RequestParametersConfig injection token', { factory: () => ({}) });
