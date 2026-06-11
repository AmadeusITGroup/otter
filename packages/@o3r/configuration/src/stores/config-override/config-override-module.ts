import {
  EnvironmentProviders,
  InjectionToken,
  makeEnvironmentProviders,
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
import {
  Action,
  ActionReducer,
  provideState,
  StoreModule,
} from '@ngrx/store';
import {
  configOverrideReducer,
} from './config-override.reducer';
import {
  CONFIG_OVERRIDE_STORE_NAME,
  ConfigOverrideState,
} from './config-override.state';

/** Token of the ConfigOverride reducer */
export const CONFIG_OVERRIDE_REDUCER_TOKEN = new InjectionToken<ActionReducer<ConfigOverrideState, Action>>('Feature ConfigOverride Reducer');

/** Provide default reducer for ConfigOverride store */
export function getDefaultConfigOverrideReducer() {
  return configOverrideReducer;
}

/**
 * @deprecated Will be removed in v16. Use {@link provideConfigOverrideStore} instead.
 */
@NgModule({
  imports: [
    StoreModule.forFeature(CONFIG_OVERRIDE_STORE_NAME, CONFIG_OVERRIDE_REDUCER_TOKEN)
  ],
  providers: [
    { provide: CONFIG_OVERRIDE_REDUCER_TOKEN, useFactory: getDefaultConfigOverrideReducer }
  ]
})
export class ConfigOverrideStoreModule {
  public static forRoot<T extends ConfigOverrideState>(reducerFactory: () => ActionReducer<T, Action>): ModuleWithProviders<ConfigOverrideStoreModule> {
    return {
      ngModule: ConfigOverrideStoreModule,
      providers: [
        { provide: CONFIG_OVERRIDE_REDUCER_TOKEN, useFactory: reducerFactory }
      ]
    };
  }
}

/**
 * Provide ConfigOverride feature store.
 * @param reducerFactory Optional factory to override the default reducer.
 */
export function provideConfigOverrideStore(reducerFactory?: () => ActionReducer<ConfigOverrideState, Action>): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideState(CONFIG_OVERRIDE_STORE_NAME, reducerFactory ? reducerFactory() : configOverrideReducer)
  ]);
}
