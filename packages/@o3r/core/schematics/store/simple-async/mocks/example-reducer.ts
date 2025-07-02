export const asyncSimpleReducerContent = `import {ActionCreator, createReducer, on, ReducerTypes} from '@ngrx/store';
import {asyncStoreItemAdapter} from '@o3r/core';
import * as actions from './example.actions';
import {ExampleState} from './example.state';

/**
 * example initial state
 */
export const exampleInitialState: ExampleState = {
  model: null,
  requestIds: []
};

/**
 * List of basic actions for Example Store
 */
export const exampleReducerFeatures: ReducerTypes<ExampleState, ActionCreator[]>[] = [

  on(actions.setExample, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload}, payload.requestId)
  ),

  on(actions.updateExample, (state, payload) => asyncStoreItemAdapter.resolveRequest({...state, ...payload}, payload.requestId)),

  on(actions.resetExample, () => exampleInitialState),

  on(actions.cancelExampleRequest, (state, action) => asyncStoreItemAdapter.resolveRequest(state, action.requestId)),

  on(actions.failExample, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setExampleFromApi, actions.updateExampleFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId))
];

/**
 * Example Store reducer
 */
export const exampleReducer = createReducer(
  exampleInitialState,
  ...exampleReducerFeatures
);
`;
