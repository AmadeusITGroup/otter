import { InjectionToken } from '@angular/core';
import { RequestParametersConfig } from './request-parameters.config';

/**
 * Token to be provided in case of service customization needs.
 *
 * @deprecated use REQUEST_PARAMETERS_CONFIG_TOKEN from @o3r/dynamic-content instead, will be removed in v10
 */
export const REQUEST_PARAMETERS_CONFIG_TOKEN = new InjectionToken<Partial<RequestParametersConfig>>('RequestParametersConfig injection token', {factory: () => ({})});
