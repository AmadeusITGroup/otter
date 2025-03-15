import {
  APP_BASE_HREF,
} from '@angular/common';
import {
  InjectionToken,
  makeEnvironmentProviders,
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
import {
  type BuildTimeProperties,
  DEFAULT_BUILD_PROPERTIES,
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

/**
 * @deprecated Will be removed in v14.
 */
@NgModule()
export class AppServerRoutingModule {
  /**
   * Injects the APP_BASE_HREF with a custom factory
   * @param config The application environment configuration
   * @deprecated Please use {@link provideEnvironment} instead. Will be removed in v14.
   */
  public static forRoot(config: Partial<BuildTimeProperties>): ModuleWithProviders<AppServerRoutingModule> {
    return {
      ngModule: AppServerRoutingModule,
      providers: [
        { provide: ENVIRONMENT_CONFIG_TOKEN, useValue: { ...DEFAULT_BUILD_PROPERTIES, ...config } },
        {
          provide: APP_BASE_HREF,
          useFactory: appBaseHrefFactory,
          deps: [ENVIRONMENT_CONFIG_TOKEN]
        }
      ]
    };
  }
}

/**
 * Provide environment configuration
 * @note it will also provide APP_BASE_HREF based on the environment configuration
 * @param config
 */
export function provideEnvironment(config: Partial<BuildTimeProperties>) {
  return makeEnvironmentProviders([
    { provide: ENVIRONMENT_CONFIG_TOKEN, useValue: { ...DEFAULT_BUILD_PROPERTIES, ...config } },
    {
      provide: APP_BASE_HREF,
      useFactory: appBaseHrefFactory,
      deps: [ENVIRONMENT_CONFIG_TOKEN]
    }
  ]);
}
