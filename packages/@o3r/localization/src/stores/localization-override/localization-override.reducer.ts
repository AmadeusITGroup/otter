import {ActionCreator, createReducer, on, ReducerTypes} from '@ngrx/store';
import * as actions from './localization-override.actions';
import { LocalizationOverrideState} from './localization-override.state';

/**
 * LocalizationOverride Store initial value
 */
export const localizationOverrideInitialState: LocalizationOverrideState = {localizationOverrides: {}};

/**
 *  List of basic actions for LocalizationOverride Store
 */
export const localizationOverrideReducerFeatures: ReducerTypes<LocalizationOverrideState, ActionCreator[]>[] = [
  on(actions.setLocalizationOverride, (_state, payload) => ({...payload.state}))
];

/**
 * LocalizationOverride Store reducer
 */
export const localizationOverrideReducer = createReducer(
  localizationOverrideInitialState,
  ...localizationOverrideReducerFeatures
);
