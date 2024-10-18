import {
  createFeatureSelector,
  createSelector
} from '@ngrx/store';
import {
  ASSET_PATH_OVERRIDE_STORE_NAME,
  AssetPathOverrideState
} from './asset-path-override.state';

/** Select AssetPathOverride State */
export const selectAssetPathOverrideState = createFeatureSelector<AssetPathOverrideState>(ASSET_PATH_OVERRIDE_STORE_NAME);

/** Select all assetPath override map */
export const selectAssetPathOverride = createSelector(selectAssetPathOverrideState, (state) => state?.assetPathOverrides || {});
