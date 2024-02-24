import type { Serializer } from '@o3r/core';
import { assetPathOverrideInitialState } from './asset-path-override.reducer';
import { AssetPathOverrideState } from './asset-path-override.state';

/**
 * Deserializer
 * @param rawObject
 */
export const assetPathOverrideStorageDeserializer = (rawObject: any) => {
  if (!rawObject) {
    return assetPathOverrideInitialState;
  }
  return rawObject;
};

export const assetPathOverrideStorageSync: Serializer<AssetPathOverrideState> = {
  deserialize: assetPathOverrideStorageDeserializer
};
