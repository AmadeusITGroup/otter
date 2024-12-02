import {
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
import {
  C11nDirective,
} from './c11n.directive';
import {
  C11nService,
} from './c11n.service';
import {
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

@NgModule({
  declarations: [C11nDirective],
  exports: [C11nDirective]
})
export class C11nModule {
  /**
   * Get the module with providers for the root component
   * @param config -> registerCompFunc - a function which returns the map of custom components which will be injected in c11n service
   * @param config.registerCompFunc
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
