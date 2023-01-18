import {ActionCreator, createReducer, on, ReducerTypes} from '@ngrx/store';
import * as actions from './config-override.actions';
import {ConfigOverrideState} from './config-override.state';

/**
 * ConfigOverride Store initial value
 */
export const configOverrideInitialState: ConfigOverrideState = {configOverrides: {}};

/**
 *  List of basic actions for ConfigOverride Store
 */
export const configOverrideReducerFeatures: ReducerTypes<ConfigOverrideState, ActionCreator[]>[] = [
  on(actions.setConfigOverride, (_state, payload) => ({...payload.state}))
];

/**
 * ConfigOverride Store reducer
 */
export const configOverrideReducer = createReducer(
  configOverrideInitialState,
  ...configOverrideReducerFeatures
);
