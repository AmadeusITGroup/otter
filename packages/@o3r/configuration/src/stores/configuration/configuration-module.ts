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
  configurationReducer,
} from './configuration.reducer';
import {
  CONFIGURATION_STORE_NAME,
  ConfigurationState,
} from './configuration.state';

/** Token of the Configuration reducer */
export const CONFIGURATION_REDUCER_TOKEN = new InjectionToken<ActionReducer<ConfigurationState, Action>>('Feature Configuration Reducer');

/** Provide default reducer for Configuration store */
export function getDefaultConfigurationReducer() {
  return configurationReducer;
}

/** @deprecated Will be removed in v16. Use {@link provideConfigurationStore} instead. */
@NgModule({
  imports: [
    StoreModule.forFeature(CONFIGURATION_STORE_NAME, CONFIGURATION_REDUCER_TOKEN)
  ],
  providers: [
    { provide: CONFIGURATION_REDUCER_TOKEN, useFactory: getDefaultConfigurationReducer }
  ]
})
export class ConfigurationStoreModule {
  public static forRoot<T extends ConfigurationState>(reducerFactory: () => ActionReducer<T, Action>): ModuleWithProviders<ConfigurationStoreModule> {
    return {
      ngModule: ConfigurationStoreModule,
      providers: [
        { provide: CONFIGURATION_REDUCER_TOKEN, useFactory: reducerFactory }
      ]
    };
  }
}

/**
 * Provide the Configuration store for the application.
 * @param reducerFactory Optional custom reducer factory. Falls back to the default reducer.
 */
export function provideConfigurationStore(reducerFactory?: () => ActionReducer<ConfigurationState, Action>): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideState(CONFIGURATION_STORE_NAME, reducerFactory ? reducerFactory() : configurationReducer),
    { provide: CONFIGURATION_REDUCER_TOKEN, useFactory: reducerFactory || (() => configurationReducer) }
  ]);
}
