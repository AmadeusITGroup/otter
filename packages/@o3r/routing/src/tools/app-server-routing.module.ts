import {
  APP_BASE_HREF,
} from '@angular/common';
import {
  InjectionToken,
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
import type {
  BuildTimeProperties,
} from '@o3r/core';

/**
 * AppBaseHref factory function
 * The APP_BASE_HREF will assume one of the following values (ordered by priority):
 * 1- undefined (or disabled) if it's not a PROD environment
 * 2- the content of the data tag data-appbasehref in the body if it exists
 * 3- the content of config.APP_BASE_HREF if defined
 * 4- otherwise, undefined
 * @param config The application environment configuration
 */
export function appBaseHrefFactory(config: BuildTimeProperties) {
  if (config.ENVIRONMENT !== 'prod') {
    return;
  }
  const dynamicBaseHref: string | undefined = document.body.dataset.appbasehref;
  if (typeof dynamicBaseHref !== 'undefined') {
    return dynamicBaseHref;
  }
  return typeof config.APP_BASE_HREF === 'string' ? config.APP_BASE_HREF : undefined;
}

export const ENVIRONMENT_CONFIG_TOKEN = new InjectionToken<BuildTimeProperties>('Environment config');

@NgModule()
export class AppServerRoutingModule {
  /**
   * Injects the APP_BASE_HREF with a custom factory
   * @param config The application environment configuration
   */
  public static forRoot(config: BuildTimeProperties): ModuleWithProviders<AppServerRoutingModule> {
    return {
      ngModule: AppServerRoutingModule,
      providers: [
        { provide: ENVIRONMENT_CONFIG_TOKEN, useValue: config },
        {
          provide: APP_BASE_HREF,
          useFactory: appBaseHrefFactory,
          deps: [ENVIRONMENT_CONFIG_TOKEN]
        }
      ]
    };
  }
}
