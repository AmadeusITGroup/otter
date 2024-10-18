import {
  createFeatureSelector,
  createSelector
} from '@ngrx/store';
import {
  LOCALIZATION_OVERRIDE_STORE_NAME,
  LocalizationOverrideState
} from './localization-override.state';

/** Select LocalizationOverride State */
export const selectLocalizationOverrideState = createFeatureSelector<LocalizationOverrideState>(LOCALIZATION_OVERRIDE_STORE_NAME);

/** Select all localization override map */
export const selectLocalizationOverride = createSelector(selectLocalizationOverrideState, (state) => state?.localizationOverrides || {});
