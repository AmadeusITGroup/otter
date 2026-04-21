import {
  type EnvironmentProviders,
  InjectionToken,
  makeEnvironmentProviders,
} from '@angular/core';
import {
  Action,
  ActionReducer,
  provideState,
} from '@ngrx/store';
import {
  localizationOverrideReducer,
} from './localization-override.reducer';
import {
  LOCALIZATION_OVERRIDE_STORE_NAME,
  LocalizationOverrideState,
} from './localization-override.state';

/** Token of the LocalizationOverride reducer */
export const LOCALIZATION_OVERRIDE_REDUCER_TOKEN = new InjectionToken<ActionReducer<LocalizationOverrideState, Action>>('Feature LocalizationOverride Reducer');

/** Provide default reducer for LocalizationOverride store */
export function getDefaultLocalizationOverrideReducer() {
  return localizationOverrideReducer;
}

/**
 * Provide the localization override store for the application.
 * This is the recommended way to set up the localization override store in standalone applications.
 * @param reducerFactory Optional custom reducer factory. If not provided, uses the default reducer.
 * @example Provide the localization store at the application bootstrap
 * ```typescript
 * bootstrapApplication(App, {
 *   providers: [
 *     provideStore(),
 *     provideLocalizationOverrideStore()
 *   ]
 * });
 * ```
 */
export function provideLocalizationOverrideStore(reducerFactory?: () => ActionReducer<LocalizationOverrideState, Action>): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideState(LOCALIZATION_OVERRIDE_STORE_NAME, LOCALIZATION_OVERRIDE_REDUCER_TOKEN),
    { provide: LOCALIZATION_OVERRIDE_REDUCER_TOKEN, useFactory: reducerFactory ?? getDefaultLocalizationOverrideReducer }
  ]);
}
