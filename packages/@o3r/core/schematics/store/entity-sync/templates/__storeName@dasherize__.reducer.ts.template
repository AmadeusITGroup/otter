import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';
import {ActionCreator, createReducer, on, ReducerTypes} from '@ngrx/store';
import * as actions from './<%= fileName %>.actions';

import {<%= storeName %>State, <%= storeName %>StateDetails, <%= storeModelName %>} from './<%= fileName %>.state';

/**
 * <%= storeName %> Store adapter
 */
export const <%= cStoreName %>Adapter: EntityAdapter<<%= storeModelName %>> = createEntityAdapter<<%= storeModelName %>>({
  selectId: (model) => model.<%= modelIdPropName %>
});

/**
 * <%= storeName %> Store initial value
 */
export const <%= cStoreName %>InitialState: <%= storeName %>State = <%= cStoreName %>Adapter.getInitialState<<%= storeName %>StateDetails>({});

/**
 *  List of basic actions for <%= storeName %> Store
 */
export const <%= cStoreName %>ReducerFeatures: ReducerTypes<<%= storeName %>State, ActionCreator[]>[] = [
  on(actions.set<%= storeName %>, (state, payload) => ({ids: state.ids, entities: state.entities, ...payload.stateDetails})),

  on(actions.update<%= storeName %>, (state, payload) => ({...state, ...payload.stateDetails})),

  on(actions.reset<%= storeName %>, () => <%= cStoreName %>InitialState),

  on(actions.set<%= storeName %>Entities, (state, payload) => <%= cStoreName %>Adapter.addMany(payload.entities, <%= cStoreName %>Adapter.removeAll(state))),

  on(actions.update<%= storeName %>Entities, (state, payload) =>
    <%= cStoreName %>Adapter.updateMany(payload.entities.map((entity) => ({id: entity.<%= modelIdPropName %>, changes: entity})), state)),

  on(actions.upsert<%= storeName %>Entities, (state, payload) => <%= cStoreName %>Adapter.upsertMany(payload.entities, state)),

  on(actions.clear<%= storeName %>Entities, (state) =>  <%= cStoreName %>Adapter.removeAll(state))
];

/**
 * <%= storeName %> Store reducer
 */
export const <%= cStoreName %>Reducer = createReducer(
  <%= cStoreName %>InitialState,
  ...<%= cStoreName %>ReducerFeatures
);
