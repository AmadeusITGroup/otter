import {
  Serializer,
} from '@o3r/core';
import {
  localizationOverrideInitialState,
} from './localization-override.reducer';
import {
  LocalizationOverrideState,
} from './localization-override.state';

/**
 * Deserializer for the LocalizationOverride store storage
 * @param rawObject
 */
export const localizationOverrideStorageDeserializer = (rawObject: any) => {
  if (!rawObject) {
    return localizationOverrideInitialState;
  }
  return rawObject;
};

/** Serializer/Deserializer configuration for the LocalizationOverride store sync */
export const localizationOverrideStorageSync: Serializer<LocalizationOverrideState> = {
  deserialize: localizationOverrideStorageDeserializer
};
