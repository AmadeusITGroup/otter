import {ModuleWithProviders, NgModule} from '@angular/core';

import { RequestParametersService} from './request-parameters.service';
import { REQUEST_PARAMETERS_CONFIG_TOKEN } from './request-parameters.token';

import {RequestParametersConfig} from './request-parameters.config';

/**
 * Empty configuration factory, used when config is not provided. It needs a separate function for AOT.
 */
export function defaultConfigFactory() {
  return {};
}
/**
 * RequestParametersService Module
 */
@NgModule({
  imports: [],
  providers: [
    {
      provide: REQUEST_PARAMETERS_CONFIG_TOKEN,
      useValue: {}
    },
    RequestParametersService
  ]
})
export class RequestParametersModule {
  public static forRoot(config: () => Partial<RequestParametersConfig> = defaultConfigFactory): ModuleWithProviders<RequestParametersModule> {
    return {
      ngModule: RequestParametersModule,
      providers: [
        {
          provide: REQUEST_PARAMETERS_CONFIG_TOKEN,
          useFactory: config
        },
        RequestParametersService
      ]
    };
  }
}
