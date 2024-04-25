/**
 * AssetPathOverride store state
 */
export interface AssetPathOverrideState {
  /** Mapping of asset path (key) and its override (value)*/
  assetPathOverrides: Record<string,string>;
}

/**
 * Name of the AssetPathOverride Store
 */
export const ASSET_PATH_OVERRIDE_STORE_NAME = 'assetPathOverride';

/**
 * AssetPathOverride Store Interface
 */
export interface AssetPathOverrideStore {
  /** AssetPathOverride state */
  [ASSET_PATH_OVERRIDE_STORE_NAME]: AssetPathOverrideState;
}
