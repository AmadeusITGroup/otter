import {
  APP_BASE_HREF,
} from '@angular/common';
import {
  InjectionToken,
  makeEnvironmentProviders,
  type Provider,
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

type EnvironmentFeatureKind = 'base-href';

interface EnvironmentFeature<FeatureKind extends EnvironmentFeatureKind> {
  ɵkind: FeatureKind;
  ɵproviders: Provider[];
}

type BaseHrefFeature = EnvironmentFeature<'base-href'>;

type EnvironmentFeatures = BaseHrefFeature;

/**
 * Specify a custom base href
 * @param baseHref
 */
export function withBaseHref<T extends string | undefined>(baseHref: T | ((environmentConfig: BuildTimeProperties) => T)): EnvironmentFeatures {
  return {
    ɵkind: 'base-href',
    ɵproviders: [
      {
        provide: APP_BASE_HREF,
        ...(
          typeof baseHref === 'function'
            ? { useFactory: baseHref, deps: [ENVIRONMENT_CONFIG_TOKEN] }
            : { useValue: baseHref }
        )
      }
    ]
  };
}

/**
 * Provide environment configuration
 * @note it will also provide APP_BASE_HREF based on the environment configuration
 * @param config
 * @param features
 */
export function provideEnvironment(config: Partial<BuildTimeProperties>, ...features: EnvironmentFeatures[]) {
  const additionalProviders = [];
  const baseHrefFeature = features.find((f) => f.ɵkind === 'base-href') ?? withBaseHref(appBaseHrefFactory);
  additionalProviders.push(baseHrefFeature.ɵproviders);

  return makeEnvironmentProviders([
    { provide: ENVIRONMENT_CONFIG_TOKEN, useValue: { ...DEFAULT_BUILD_PROPERTIES, ...config } },
    additionalProviders
  ]);
}
