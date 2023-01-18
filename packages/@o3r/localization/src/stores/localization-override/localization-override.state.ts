/**
 * LocalizationOverride store state
 */
export interface LocalizationOverrideState {
  /** Mapping of initial localization keys to the one they are replaced with */
  localizationOverrides : Record<string,string>;
}

/**
 * Name of the LocalizationOverride Store
 */
export const LOCALIZATION_OVERRIDE_STORE_NAME = 'localizationOverride';

/**
 * LocalizationOverride Store Interface
 */
export interface LocalizationOverrideStore {
  /** LocalizationOverride state */
  [LOCALIZATION_OVERRIDE_STORE_NAME]: LocalizationOverrideState;
}
