import {ActionCreator, createReducer, on, ReducerTypes} from '@ngrx/store';
import * as actions from './<%= fileName %>.actions';
import {<%= storeName %>State} from './<%= fileName %>.state';

/**
 * <%= cStoreName %> initial state
 */
export const <%= cStoreName %>InitialState: <%= storeName %>State = {};

/**
 * List of basic actions for <%= storeName %> Store
 */
export const <%= cStoreName %>ReducerFeatures: ReducerTypes<<%= storeName %>State, ActionCreator[]>[] = [
  on(actions.set<%= storeName %>, (_state, payload) => ({...payload.model})),

  on(actions.update<%= storeName %>, (state, payload) => ({...state, ...payload.model})),

  on(actions.reset<%= storeName %>, () => <%= cStoreName %>InitialState)
];

/**
 * <%= storeName %> Store reducer
 */
export const <%= cStoreName %>Reducer = createReducer(
  <%= cStoreName %>InitialState,
  ...<%= cStoreName %>ReducerFeatures
);
