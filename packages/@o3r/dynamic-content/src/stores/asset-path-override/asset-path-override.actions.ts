import { createAction, props } from '@ngrx/store';
import type { SetStateActionPayload } from '@o3r/core';
import { AssetPathOverrideState } from './asset-path-override.state';

/** Actions */
const ACTION_SET = '[AssetPathOverride] set entities';

/**
 * Clear all overrides and fill the store with the payload
 */
export const setAssetPathOverride = createAction(ACTION_SET, props<SetStateActionPayload<AssetPathOverrideState>>());
