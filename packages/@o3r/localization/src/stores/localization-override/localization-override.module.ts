import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';

import { localizationOverrideReducer } from './localization-override.reducer';
import { LOCALIZATION_OVERRIDE_STORE_NAME, LocalizationOverrideState } from './localization-override.state';

/** Token of the LocalizationOverride reducer */
export const LOCALIZATION_OVERRIDE_REDUCER_TOKEN = new InjectionToken<ActionReducer<LocalizationOverrideState, Action>>('Feature LocalizationOverride Reducer');

/** Provide default reducer for LocalizationOverride store */
export function getDefaultLocalizationOverrideReducer() {
  return localizationOverrideReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(LOCALIZATION_OVERRIDE_STORE_NAME, LOCALIZATION_OVERRIDE_REDUCER_TOKEN)
  ],
  providers: [
    { provide: LOCALIZATION_OVERRIDE_REDUCER_TOKEN, useFactory: getDefaultLocalizationOverrideReducer }
  ]
})
export class LocalizationOverrideStoreModule {
  public static forRoot<T extends LocalizationOverrideState>(reducerFactory: () => ActionReducer<T, Action>): ModuleWithProviders<LocalizationOverrideStoreModule> {
    return {
      ngModule: LocalizationOverrideStoreModule,
      providers: [
        { provide: LOCALIZATION_OVERRIDE_REDUCER_TOKEN, useFactory: reducerFactory }
      ]
    };
  }
}
