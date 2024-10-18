import {
  InjectionToken,
  ModuleWithProviders,
  NgModule
} from '@angular/core';
import {
  Action,
  ActionReducer,
  StoreModule
} from '@ngrx/store';
import {
  configurationReducer
} from './configuration.reducer';
import {
  CONFIGURATION_STORE_NAME,
  ConfigurationState
} from './configuration.state';

/** Token of the Configuration reducer */
export const CONFIGURATION_REDUCER_TOKEN = new InjectionToken<ActionReducer<ConfigurationState, Action>>('Feature Configuration Reducer');

/** Provide default reducer for Configuration store */
export function getDefaultConfigurationReducer() {
  return configurationReducer;
}

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
