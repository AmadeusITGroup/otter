import {ActionCreator, createReducer, on, ReducerTypes} from '@ngrx/store';
import {createEntityAdapter} from '@ngrx/entity';
import {asyncStoreItemAdapter, createEntityAsyncRequestAdapter} from '@o3r/core';
import * as actions from './pet.actions';
import {PetModel, PetState, PetStateDetails} from './pet.state';

/**
 * Pet Store adapter
 */
export const petAdapter = createEntityAsyncRequestAdapter(createEntityAdapter<PetModel>({
  selectId: (model) => model.name
}));

/**
 * Pet Store initial value
 */
export const petInitialState: PetState = petAdapter.getInitialState<PetStateDetails>({
  requestIds: []
});

/**
 * List of basic actions for Pet Store
 */
export const petReducerFeatures: ReducerTypes<PetState, ActionCreator[]>[] = [
  on(actions.resetPet, () => petInitialState),

  on(actions.setPet, (state, payload) => ({ids: state.ids, entities: state.entities, ...payload.stateDetails})),

  on(actions.cancelPetRequest, (state, action) => asyncStoreItemAdapter.resolveRequest(state, action.requestId)),

  on(actions.updatePet, (state, payload) => ({...state, ...payload.stateDetails})),

  on(actions.setPetEntities, (state, payload) =>
    petAdapter.addMany(
      payload.entities.map((entity) => asyncStoreItemAdapter.initialize(entity)),
      petAdapter.removeAll(asyncStoreItemAdapter.resolveRequest(state, payload.requestId)))
  ),

  on(actions.updatePetEntities, (state, payload) =>
    petAdapter.resolveRequestMany(state, payload.entities, payload.requestId, 'name')
  ),

  on(actions.upsertPetEntities, (state, payload) =>
    petAdapter.upsertMany(
      payload.entities.map((entity) => asyncStoreItemAdapter.initialize(entity)),
      asyncStoreItemAdapter.resolveRequest(state, payload.requestId)
    )
  ),

  on(actions.clearPetEntities, (state) => petAdapter.removeAll(state)),

  on(actions.failPetEntities, (state, payload) =>
    petAdapter.failRequestMany(state, payload && payload.ids, payload.requestId)
  ),

  on(actions.setPetEntitiesFromApi, actions.upsertPetEntitiesFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)),

  on(actions.updatePetEntitiesFromApi, (state, payload) =>
    petAdapter.addRequestMany(state, payload.ids, payload.requestId)),

  on(actions.removePetEntitiesFromApi, (state, payload) => asyncStoreItemAdapter.addRequest(state, payload.requestId)),

  on(actions.removePetEntities, (state, payload) =>
    petAdapter.removeMany(payload.ids, asyncStoreItemAdapter.resolveRequest(state, payload.requestId)))
];

/**
 * Pet Store reducer
 */
export const petReducer = createReducer(
  petInitialState,
  ...petReducerFeatures
);
