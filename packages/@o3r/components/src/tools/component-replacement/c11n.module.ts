import {
  makeEnvironmentProviders,
  ModuleWithProviders,
  NgModule,
  type Type,
} from '@angular/core';
import type {
  Context,
} from '@o3r/core';
import {
  C11nDirective,
} from './c11n.directive';
import {
  C11nService,
} from './c11n.service';
import {
  C11N_PRESENTERS_MAP_TOKEN,
  C11N_REGISTER_FUNC_TOKEN,
} from './c11n.token';

/**
 * Customization service factory
 * @param config -> registerCompFunc - a function which returns the map of custom components which will be injected in c11n service
 * @param config.registerCompFunc
 */
export function createC11nService(config: { registerCompFunc: () => Map<string, any> }) {
  if (!config) {
    return new C11nService(new Map());
  }
  const custoComp = config.registerCompFunc();
  return new C11nService(custoComp);
}

/**
 * @deprecated Will be removed in v14.
 */
@NgModule({
  imports: [C11nDirective],
  exports: [C11nDirective]
})
export class C11nModule {
  /**
   * Get the module with providers for the root component
   * @param config -> registerCompFunc - a function which returns the map of custom components which will be injected in c11n service
   * @param config.registerCompFunc
   * @deprecated Please use {@link provideCustomComponents} instead. Will be removed in v14.
   */
  public static forRoot(config: { registerCompFunc: () => Map<string, any> }): ModuleWithProviders<C11nModule> {
    return {
      ngModule: C11nModule,
      providers: [{
        provide: C11N_REGISTER_FUNC_TOKEN,
        useValue: config
      },
      {
        provide: C11nService, useFactory: createC11nService, deps: [C11N_REGISTER_FUNC_TOKEN]
      }]
    };
  }
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
