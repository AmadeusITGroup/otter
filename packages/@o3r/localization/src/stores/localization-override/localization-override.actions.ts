import { createAction, props } from '@ngrx/store';
import { SetStateActionPayload } from '@o3r/core';
import { LocalizationOverrideState } from './localization-override.state';

/** Actions */
const ACTION_SET = '[LocalizationOverride] set';

/**
 * Clear all overrides and fill the store with the payload
 */
export const setLocalizationOverride = createAction(ACTION_SET, props<SetStateActionPayload<LocalizationOverrideState>>());
