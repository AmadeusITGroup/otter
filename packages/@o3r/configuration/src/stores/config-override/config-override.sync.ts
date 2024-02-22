import { Serializer } from '@o3r/core';
import { configOverrideInitialState } from './config-override.reducer';
import { ConfigOverrideState } from './config-override.state';

/**
 * Deserializer
 * @param rawObject
 */
export const configOverrideStorageDeserializer = (rawObject: any) => {
  if (!rawObject) {
    return configOverrideInitialState;
  }
  return rawObject;
};

export const configOverrideStorageSync: Serializer<ConfigOverrideState> = {
  deserialize: configOverrideStorageDeserializer
};
