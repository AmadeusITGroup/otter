import {
  createAction,
  props
} from '@ngrx/store';
import {
  SetStateActionPayload
} from '@o3r/core';
import {
  ConfigOverrideState
} from './config-override.state';

/** Actions */
const ACTION_SET = '[ConfigOverride] set';

/**
 * Clear all overrides and fill the store with the payload
 */
export const setConfigOverride = createAction(ACTION_SET, props<SetStateActionPayload<ConfigOverrideState>>());
