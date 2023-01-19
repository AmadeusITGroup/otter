export const asyncEntityReducerContent = `import {ActionCreator, createReducer, on, ReducerTypes} from '@ngrx/store';
import {createEntityAdapter} from '@ngrx/entity';
import {asyncStoreItemAdapter, createEntityAsyncRequestAdapter} from '@o3r/core';
import * as actions from './example.actions';
import {ExampleState, ExampleStateDetails, ExampleModel} from './example.state';

/**
 * Example Store adapter
 */
export const exampleAdapter = createEntityAsyncRequestAdapter(createEntityAdapter<ExampleModel>({
  selectId: (model) => model.id
}));

/**
 * Example Store initial value
 */
export const exampleInitialState: ExampleState = exampleAdapter.getInitialState<ExampleStateDetails>({
  requestIds: []
});

/**
 * List of basic actions for Example Store
 */
export const exampleReducerFeatures: ReducerTypes<ExampleState, ActionCreator[]>[] = [
  on(actions.resetExample, () => exampleInitialState),

  on(actions.setExample, (state, payload) => ({ids: state.ids, entities: state.entities, ...payload.stateDetails})),

  on(actions.cancelExampleRequest, (state, action) => asyncStoreItemAdapter.resolveRequest(state, action.requestId)),

  on(actions.updateExample, (state, payload) => ({...state, ...payload.stateDetails})),

  on(actions.setExampleEntities, (state, payload) => exampleAdapter.addMany(
      payload.entities.map((entity) => asyncStoreItemAdapter.initialize(entity)),
      exampleAdapter.removeAll(asyncStoreItemAdapter.resolveRequest(state, payload.requestId)))
  ),

  on(actions.updateExampleEntities, (state, payload) =>
    exampleAdapter.resolveRequestMany(state, payload.entities, payload.requestId)
  ),

  on(actions.upsertExampleEntities, (state, payload) =>
    exampleAdapter.upsertMany(
      payload.entities.map((entity) => asyncStoreItemAdapter.initialize(entity)),
      asyncStoreItemAdapter.resolveRequest(state, payload.requestId)
    )
  ),

  on(actions.clearExampleEntities, (state) =>  exampleAdapter.removeAll(state)),

  on( actions.failExampleEntities, (state, payload) => exampleAdapter.failRequestMany(state, payload && payload.ids, payload.requestId)),

  on(actions.setExampleEntitiesFromApi, actions.upsertExampleEntitiesFromApi, (state, payload) => asyncStoreItemAdapter.addRequest(state, payload.requestId)),

  on(actions.updateExampleEntitiesFromApi, (state, payload) =>
      exampleAdapter.addRequestMany(state, payload.ids, payload.requestId))
];

/**
 * Example Store reducer
 */
export const exampleReducer = createReducer(
  exampleInitialState,
  ...exampleReducerFeatures
);`;
