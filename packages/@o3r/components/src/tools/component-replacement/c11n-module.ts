import {
  Injector,
  makeEnvironmentProviders,
  type Type,
} from '@angular/core';
import type {
  Context,
} from '@o3r/core';
import {
  C11nService,
} from './c11n-service';
import {
  C11N_PRESENTERS_MAP_TOKEN,
} from './c11n-token';

/**
 * Customization service factory
 * @param config -> registerCompFunc - a function which returns the map of custom components which will be injected in c11n service
 * @param config.registerCompFunc
 */
export function createC11nService(config: { registerCompFunc: () => Map<string, any> }) {
  const injector = Injector.create({
    providers: [
      { provide: C11N_PRESENTERS_MAP_TOKEN, useValue: (config ? config.registerCompFunc() : new Map()) },
      { provide: C11nService, deps: [C11N_PRESENTERS_MAP_TOKEN] }
    ]
  });
  return injector.get(C11nService);
}

/**
 * Returns a tuple of the key and the component
 * @note should be used with {@link provideCustomComponents}
 * @example
 * ```typescript
 * provideCustomComponents(
 *   new Map(),
 *   withComponent('example1', MyFirstComponent),
 *   withComponent('example2', MySecondComponent),
 * )
 * ```
 * @param customComponentKey
 * @param customComponent
 */
export function withComponent<T extends Context>(customComponentKey: string, customComponent: Type<T>): [string, Type<T>] {
  return [customComponentKey, customComponent];
}

/**
 * Provide custom components which will be injected in c11n service
 * @param customComponents
 * @param additionalComponents
 */
export function provideCustomComponents(customComponents: Map<string, any> = new Map(), ...additionalComponents: (ReturnType<typeof withComponent>)[]) {
  additionalComponents.forEach(([customComponentKey, customComponent]) => customComponents.set(customComponentKey, customComponent));
  return makeEnvironmentProviders([
    C11nService,
    {
      provide: C11N_PRESENTERS_MAP_TOKEN,
      useValue: customComponents
    }
  ]);
}
