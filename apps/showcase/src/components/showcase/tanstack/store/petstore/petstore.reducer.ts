import {ActionCreator, createReducer, on, ReducerTypes} from '@ngrx/store';
import {createEntityAdapter} from '@ngrx/entity';
import {asyncStoreItemAdapter, createEntityAsyncRequestAdapter} from '@o3r/core';
import * as actions from './petstore.actions';
import {PetModel, PetstoreState, PetstoreStateDetails} from './petstore.state';

/**
 * Petstore Store adapter
 */
export const petstoreAdapter = createEntityAsyncRequestAdapter(createEntityAdapter<PetModel>({
  selectId: (model) => model.id
}));

/**
 * Petstore Store initial value
 */
export const petstoreInitialState: PetstoreState = petstoreAdapter.getInitialState<PetstoreStateDetails>({
  requestIds: []
});

/**
 * List of basic actions for Petstore Store
 */
export const petstoreReducerFeatures: ReducerTypes<PetstoreState, ActionCreator[]>[] = [
  on(actions.resetPetstore, () => petstoreInitialState),

  on(actions.setPetstore, (state, payload) => ({ids: state.ids, entities: state.entities, ...payload.stateDetails})),

  on(actions.cancelPetstoreRequest, (state, action) => asyncStoreItemAdapter.resolveRequest(state, action.requestId)),

  on(actions.updatePetstore, (state, payload) => ({...state, ...payload.stateDetails})),

  on(actions.setPetstoreEntities, (state, payload) =>
    petstoreAdapter.addMany(
      payload.entities.map((entity) => asyncStoreItemAdapter.initialize(entity)),
      petstoreAdapter.removeAll(asyncStoreItemAdapter.resolveRequest(state, payload.requestId)))
  ),

  on(actions.updatePetstoreEntities, (state, payload) =>
    petstoreAdapter.resolveRequestMany(state, payload.entities, payload.requestId)
  ),

  on(actions.upsertPetstoreEntities, (state, payload) =>
    petstoreAdapter.upsertMany(
      payload.entities.map((entity) => asyncStoreItemAdapter.initialize(entity)),
      asyncStoreItemAdapter.resolveRequest(state, payload.requestId)
    )
  ),

  on(actions.clearPetstoreEntities, (state) => petstoreAdapter.removeAll(state)),

  on(actions.failPetstoreEntities, (state, payload) =>
    petstoreAdapter.failRequestMany(state, payload && payload.ids, payload.requestId)
  ),

  on(actions.setPetstoreEntitiesFromApi, actions.upsertPetstoreEntitiesFromApi, actions.setPetstoreEntityFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)),


  on(actions.updatePetstoreEntitiesFromApi, (state, payload) =>
    petstoreAdapter.addRequestMany(state, payload.ids, payload.requestId))
];

/**
 * Petstore Store reducer
 */
export const petstoreReducer = createReducer(
  petstoreInitialState,
  ...petstoreReducerFeatures
);
