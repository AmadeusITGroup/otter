import {
  ActionCreator,
  createReducer,
  on,
  ReducerTypes
} from '@ngrx/store';
import * as actions from './asset-path-override.actions';
import {
  AssetPathOverrideState
} from './asset-path-override.state';

/**
 * AssetPathOverride Store initial value
 */
export const assetPathOverrideInitialState: AssetPathOverrideState = { assetPathOverrides: {} };

/**
 *  List of basic actions for AssetPathOverride Store
 */
export const assetPathOverrideReducerFeatures: ReducerTypes<AssetPathOverrideState, ActionCreator[]>[] = [
  on(actions.setAssetPathOverride, (_state, payload) => ({ ...payload.state }))
];

/**
 * AssetPathOverride Store reducer
 */
export const assetPathOverrideReducer = createReducer(
  assetPathOverrideInitialState,
  ...assetPathOverrideReducerFeatures
);
