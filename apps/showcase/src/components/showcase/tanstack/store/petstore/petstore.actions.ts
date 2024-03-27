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
import {Pet} from '@ama-sdk/showcase-sdk';
import {createAction, props} from '@ngrx/store';
import {PetstoreStateDetails} from './petstore.state';

/** StateDetailsActions */
const ACTION_SET = '[Petstore] set';
const ACTION_UPDATE = '[Petstore] update';
const ACTION_RESET = '[Petstore] reset';
const ACTION_CANCEL_REQUEST = '[Petstore] cancel request';

/** Entity Actions */
const ACTION_CLEAR_ENTITIES = '[Petstore] clear entities';
const ACTION_UPDATE_ENTITIES = '[Petstore] update entities';
const ACTION_UPSERT_ENTITIES = '[Petstore] upsert entities';
const ACTION_SET_ENTITIES = '[Petstore] set entities';
const ACTION_FAIL_ENTITIES = '[Petstore] fail entities';
const ACTION_CREATE_ENTITIES_FROM_API = '[Petstore] create entity';

/** Async Actions */
const ACTION_SET_ENTITIES_FROM_API = '[Petstore] set entities from api';
const ACTION_UPDATE_ENTITIES_FROM_API = '[Petstore] update entities from api';
const ACTION_UPSERT_ENTITIES_FROM_API = '[Petstore] upsert entities from api';


/** Action to clear the StateDetails of the store and replace it */
export const setPetstore = createAction(ACTION_SET, props<SetActionPayload<PetstoreStateDetails>>());

/** Action to change a part or the whole object in the store. */
export const updatePetstore = createAction(ACTION_UPDATE, props<UpdateActionPayload<PetstoreStateDetails>>());

/** Action to reset the whole state, by returning it to initial state. */
export const resetPetstore = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelPetstoreRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/** Action to clear all petstore and fill the store with the payload */
export const setPetstoreEntities = createAction(ACTION_SET_ENTITIES, props<SetAsyncStoreItemEntitiesActionPayload<Pet>>());

/** Action to update petstore with known IDs, ignore the new ones */
export const updatePetstoreEntities = createAction(ACTION_UPDATE_ENTITIES, props<UpdateAsyncStoreItemEntitiesActionPayloadWithId<Pet>>());

/** Action to update petstore with known IDs, insert the new ones */
export const upsertPetstoreEntities = createAction(ACTION_UPSERT_ENTITIES, props<SetAsyncStoreItemEntitiesActionPayload<Pet>>());

/** Action to empty the list of entities, keeping the global state */
export const clearPetstoreEntities = createAction(ACTION_CLEAR_ENTITIES);

/** Action to update failureStatus for every Pet */
export const failPetstoreEntities = createAction(ACTION_FAIL_ENTITIES, props<FailAsyncStoreItemEntitiesActionPayload<any>>());

/**
 * Action to put the global status of the store in a pending state. Call SET action with the list of Pets received, when this action resolves.
 * If the call fails, dispatch FAIL_ENTITIES action
 */
export const setPetstoreEntitiesFromApi = createAction(ACTION_SET_ENTITIES_FROM_API, asyncProps<FromApiActionPayload<Pet[]>>());

/**
 * Action to change isPending status of elements to be updated with a request. Call UPDATE action with the list of Pets received, when this action resolves.
 * If the call fails, dispatch FAIL_ENTITIES action
 */
export const updatePetstoreEntitiesFromApi = createAction(ACTION_UPDATE_ENTITIES_FROM_API, asyncProps<FromApiActionPayload<Pet[]> & { ids: string[] }>());

/**
 * Action to put global status of the store in a pending state. Call UPSERT action with the list of Pets received, when this action resolves.
 * If the call fails, dispatch FAIL_ENTITIES action
 */
export const upsertPetstoreEntitiesFromApi = createAction(ACTION_UPSERT_ENTITIES_FROM_API, asyncProps<FromApiActionPayload<Pet[]>>());

/**
 * Action to put the global status of the store in a pending state. Call SET action with the list of Pets received, when this action resolves.
 * If the call fails, dispatch FAIL_ENTITIES action
 */
export const setPetstoreEntityFromApi = createAction(ACTION_CREATE_ENTITIES_FROM_API, asyncProps<FromApiActionPayload<Pet>>());
