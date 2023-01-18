import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';
import {ActionCreator, createReducer, on, ReducerTypes} from '@ngrx/store';
import * as actions from './configuration.actions';

import {ConfigurationModel, ConfigurationState} from './configuration.state';

/**
 * Configuration Store adapter
 */
export const configurationAdapter: EntityAdapter<ConfigurationModel> = createEntityAdapter<ConfigurationModel>({
  selectId: (model) => model.id
});

/**
 * Configuration Store initial value
 */
export const configurationInitialState: ConfigurationState = configurationAdapter.getInitialState({});

/**
 *  List of basic actions for Configuration Store
 */
export const configurationReducerFeatures: ReducerTypes<ConfigurationState, ActionCreator[]>[] = [

  on(actions.setConfigurationEntities, (state, payload) => configurationAdapter.addMany(Object.keys(payload).map((id) => ({...payload[id], id})), configurationAdapter.removeAll(state))),

  on(actions.updateConfigurationEntities, (state, payload) =>
    configurationAdapter.updateMany(Object.keys(payload.entities).map((id) => ({id: id, changes: payload.entities[id]})), state)),

  on(actions.upsertConfigurationEntities, (state, payload) => configurationAdapter.upsertMany(Object.keys(payload.entities).map((id) => ({...payload.entities[id], id})), state)),

  on(actions.clearConfigurationEntities, (state) => configurationAdapter.removeAll(state)),

  on(actions.updateConfigurationEntity, (state, payload) => configurationAdapter.updateOne({id: payload.id, changes: payload.configuration}, state)),

  on(actions.upsertConfigurationEntity, (state, payload) => configurationAdapter.upsertOne({id: payload.id, ...payload.configuration}, state))
];

/**
 * Configuration Store reducer
 */
export const configurationReducer = createReducer(
  configurationInitialState,
  ...configurationReducerFeatures
);
