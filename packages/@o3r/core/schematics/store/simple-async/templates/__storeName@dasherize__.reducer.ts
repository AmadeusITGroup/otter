import {ActionCreator, createReducer, on, ReducerTypes} from '@ngrx/store';
import {asyncStoreItemAdapter} from '@o3r/core';
import * as actions from './<%= fileName %>.actions';
import {<%= storeName %>State} from './<%= fileName %>.state';

/**
 * <%= cStoreName %> initial state
 */
export const <%= cStoreName %>InitialState: <%= storeName %>State = {
  model: null,
  requestIds: []
};

/**
 * List of basic actions for <%= storeName %> Store
 */
export const <%= cStoreName %>ReducerFeatures: ReducerTypes<<%= storeName %>State, ActionCreator[]>[] = [

  on(actions.set<%= storeName %>, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload}, payload.requestId)
  ),

  on(actions.update<%= storeName %>, (state, payload) => asyncStoreItemAdapter.resolveRequest({...state, ...payload}, payload.requestId)),

  on(actions.reset<%= storeName %>, () => <%= cStoreName %>InitialState),

  on(actions.cancel<%= storeName %>Request, (state, action) => asyncStoreItemAdapter.resolveRequest(state, action.requestId)),

  on(actions.fail<%= storeName %>, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.set<%= storeName %>FromApi, actions.update<%= storeName %>FromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId))
];

/**
 * <%= storeName %> Store reducer
 */
export const <%= cStoreName %>Reducer = createReducer(
  <%= cStoreName %>InitialState,
  ...<%= cStoreName %>ReducerFeatures
);
