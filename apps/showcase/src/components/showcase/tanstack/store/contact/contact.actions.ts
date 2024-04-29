import {
  asyncProps,
  AsyncRequest,
  FailAsyncStoreItemEntitiesActionPayload,
  FromApiActionPayload,
  SetActionPayload,
  SetAsyncStoreItemEntitiesActionPayload,
  UpdateActionPayload,
  UpdateAsyncStoreItemEntitiesActionPayloadWithId
} from '@o3r/core';

import {createAction, props} from '@ngrx/store';
// import {ContactModel} from './contact.state';
import {ContactStateDetails} from './contact.state';
import type { Contact } from '../../contact';

/** StateDetailsActions */
const ACTION_SET = '[Contact] set';
const ACTION_UPDATE = '[Contact] update';
const ACTION_RESET = '[Contact] reset';
const ACTION_CANCEL_REQUEST = '[Contact] cancel request';

/** Entity Actions */
const ACTION_CLEAR_ENTITIES = '[Contact] clear entities';
const ACTION_UPDATE_ENTITIES = '[Contact] update entities';
const ACTION_UPSERT_ENTITIES = '[Contact] upsert entities';
const ACTION_SET_ENTITIES = '[Contact] set entities';
const ACTION_FAIL_ENTITIES = '[Contact] fail entities';

/** Async Actions */
const ACTION_SET_ENTITIES_FROM_API = '[Contact] set entities from api';
const ACTION_UPDATE_ENTITIES_FROM_API = '[Contact] update entities from api';
const ACTION_UPSERT_ENTITIES_FROM_API = '[Contact] upsert entities from api';

/** Action to clear the StateDetails of the store and replace it */
export const setContact = createAction(ACTION_SET, props<SetActionPayload<ContactStateDetails>>());

/** Action to change a part or the whole object in the store. */
export const updateContact = createAction(ACTION_UPDATE, props<UpdateActionPayload<ContactStateDetails>>());

/** Action to reset the whole state, by returning it to initial state. */
export const resetContact = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelContactRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/** Action to clear all contact and fill the store with the payload */
export const setContactEntities = createAction(ACTION_SET_ENTITIES, props<SetAsyncStoreItemEntitiesActionPayload<Contact>>());

/** Action to update contact with known IDs, ignore the new ones */
export const updateContactEntities = createAction(ACTION_UPDATE_ENTITIES, props<UpdateAsyncStoreItemEntitiesActionPayloadWithId<Contact>>());

/** Action to update contact with known IDs, insert the new ones */
export const upsertContactEntities = createAction(ACTION_UPSERT_ENTITIES, props<SetAsyncStoreItemEntitiesActionPayload<Contact>>());

/** Action to empty the list of entities, keeping the global state */
export const clearContactEntities = createAction(ACTION_CLEAR_ENTITIES);

/** Action to update failureStatus for every ContactModel */
export const failContactEntities = createAction(ACTION_FAIL_ENTITIES, props<FailAsyncStoreItemEntitiesActionPayload<any>>());

/**
 * Action to put the global status of the store in a pending state. Call SET action with the list of ContactModels received, when this action resolves.
 * If the call fails, dispatch FAIL_ENTITIES action
 */
export const setContactEntitiesFromApi = createAction(ACTION_SET_ENTITIES_FROM_API, asyncProps<FromApiActionPayload<Contact[]>>());

/**
 * Action to change isPending status of elements to be updated with a request. Call UPDATE action with the list of ContactModels received, when this action resolves.
 * If the call fails, dispatch FAIL_ENTITIES action
 */
export const updateContactEntitiesFromApi = createAction(ACTION_UPDATE_ENTITIES_FROM_API, asyncProps<FromApiActionPayload<Contact[]> & { ids: string[] }>());

/**
 * Action to put global status of the store in a pending state. Call UPSERT action with the list of ContactModels received, when this action resolves.
 * If the call fails, dispatch FAIL_ENTITIES action
 */
export const upsertContactEntitiesFromApi = createAction(ACTION_UPSERT_ENTITIES_FROM_API, asyncProps<FromApiActionPayload<Contact[]>>());
