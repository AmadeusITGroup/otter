import { Serializer } from '@o3r/core';
import { localizationOverrideInitialState } from './localization-override.reducer';
import { LocalizationOverrideState } from './localization-override.state';

export const localizationOverrideStorageDeserializer = (rawObject: any) => {
  if (!rawObject) {
    return localizationOverrideInitialState;
  }
  return rawObject;
};

export const localizationOverrideStorageSync: Serializer<LocalizationOverrideState> = {
  deserialize: localizationOverrideStorageDeserializer
};
