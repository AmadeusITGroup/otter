import {ActionCreator, createReducer, on, ReducerTypes} from '@ngrx/store';
import {createEntityAdapter} from '@ngrx/entity';
import {asyncStoreItemAdapter, createEntityAsyncRequestAdapter} from '@o3r/core';
import * as actions from './contact.actions';
import {ContactModel, ContactState, ContactStateDetails} from './contact.state';

/**
 * Contact Store adapter
 */
export const contactAdapter = createEntityAsyncRequestAdapter(createEntityAdapter<ContactModel>({
  selectId: (model) => model.id
}));

/**
 * Contact Store initial value
 */
export const contactInitialState: ContactState = contactAdapter.getInitialState<ContactStateDetails>({
  requestIds: []
});

/**
 * List of basic actions for Contact Store
 */
export const contactReducerFeatures: ReducerTypes<ContactState, ActionCreator[]>[] = [
  on(actions.resetContact, () => contactInitialState),

  on(actions.setContact, (state, payload) => ({ids: state.ids, entities: state.entities, ...payload.stateDetails})),

  on(actions.cancelContactRequest, (state, action) => asyncStoreItemAdapter.resolveRequest(state, action.requestId)),

  on(actions.updateContact, (state, payload) => ({...state, ...payload.stateDetails})),

  on(actions.setContactEntities, (state, payload) =>
    contactAdapter.addMany(
      payload.entities.map((entity) => asyncStoreItemAdapter.initialize(entity)),
      contactAdapter.removeAll(asyncStoreItemAdapter.resolveRequest(state, payload.requestId)))
  ),

  on(actions.updateContactEntities, (state, payload) =>
    contactAdapter.resolveRequestMany(state, payload.entities, payload.requestId)
  ),

  on(actions.upsertContactEntities, (state, payload) =>
    contactAdapter.upsertMany(
      payload.entities.map((entity) => asyncStoreItemAdapter.initialize(entity)),
      asyncStoreItemAdapter.resolveRequest(state, payload.requestId)
    )
  ),

  on(actions.clearContactEntities, (state) => contactAdapter.removeAll(state)),

  on(actions.failContactEntities, (state, payload) =>
    contactAdapter.failRequestMany(state, payload && payload.ids, payload.requestId)
  ),

  on(actions.setContactEntitiesFromApi, actions.upsertContactEntitiesFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)),

  on(actions.updateContactEntitiesFromApi, (state, payload) =>
    contactAdapter.addRequestMany(state, payload.ids, payload.requestId))
];

/**
 * Contact Store reducer
 */
export const contactReducer = createReducer(
  contactInitialState,
  ...contactReducerFeatures
);
