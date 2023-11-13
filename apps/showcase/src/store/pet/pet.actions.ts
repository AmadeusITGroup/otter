import {
  asyncProps,
  AsyncRequest,
  FailAsyncStoreItemEntitiesActionPayload,
  FromApiActionPayload,
  SetActionPayload,
  SetAsyncStoreItemEntitiesActionPayload,
  UpdateActionPayload,
  UpdateAsyncStoreItemEntitiesActionPayload,
  WithRequestId
} from '@o3r/core';
import {Pet} from '@ama-sdk/showcase-sdk';
import {createAction, props} from '@ngrx/store';
import {PetStateDetails} from './pet.state';

/** StateDetailsActions */
const ACTION_SET = '[Pet] set';
const ACTION_UPDATE = '[Pet] update';
const ACTION_RESET = '[Pet] reset';
const ACTION_CANCEL_REQUEST = '[Pet] cancel request';

/** Entity Actions */
const ACTION_CLEAR_ENTITIES = '[Pet] clear entities';
const ACTION_UPDATE_ENTITIES = '[Pet] update entities';
const ACTION_UPSERT_ENTITIES = '[Pet] upsert entities';
const ACTION_SET_ENTITIES = '[Pet] set entities';
const ACTION_FAIL_ENTITIES = '[Pet] fail entities';
const ACTION_REMOVE_ENTITIES = '[Pet] remove entities';

/** Async Actions */
const ACTION_SET_ENTITIES_FROM_API = '[Pet] set entities from api';
const ACTION_UPDATE_ENTITIES_FROM_API = '[Pet] update entities from api';
const ACTION_UPSERT_ENTITIES_FROM_API = '[Pet] upsert entities from api';
const ACTION_REMOVE_ENTITIES_FROM_API = '[Pet] remove entities from api';

/** Action to clear the StateDetails of the store and replace it */
export const setPet = createAction(ACTION_SET, props<SetActionPayload<PetStateDetails>>());

/** Action to change a part or the whole object in the store. */
export const updatePet = createAction(ACTION_UPDATE, props<UpdateActionPayload<PetStateDetails>>());

/** Action to reset the whole state, by returning it to initial state. */
export const resetPet = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelPetRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/** Action to clear all pet and fill the store with the payload */
export const setPetEntities = createAction(ACTION_SET_ENTITIES, props<SetAsyncStoreItemEntitiesActionPayload<Pet>>());

/** Action to update pet with known IDs, ignore the new ones */
export const updatePetEntities = createAction(ACTION_UPDATE_ENTITIES, props<UpdateAsyncStoreItemEntitiesActionPayload<Pet, 'name'>>());

/** Action to update pet with known IDs, insert the new ones */
export const upsertPetEntities = createAction(ACTION_UPSERT_ENTITIES, props<SetAsyncStoreItemEntitiesActionPayload<Pet>>());

/** Action to empty the list of entities, keeping the global state */
export const clearPetEntities = createAction(ACTION_CLEAR_ENTITIES);

/** Action to update failureStatus for every Pet */
export const failPetEntities = createAction(ACTION_FAIL_ENTITIES, props<FailAsyncStoreItemEntitiesActionPayload<any>>());

/** Action to remove every Pet by their id */
export const removePetEntities = createAction(ACTION_REMOVE_ENTITIES, props<WithRequestId<{ ids: string[] }>>());

/**
 * Action to put the global status of the store in a pending state. Call SET action with the list of Pets received, when this action resolves.
 * If the call fails, dispatch FAIL_ENTITIES action
 */
export const setPetEntitiesFromApi = createAction(ACTION_SET_ENTITIES_FROM_API, asyncProps<FromApiActionPayload<Pet[]>>());

/**
 * Action to change isPending status of elements to be updated with a request. Call UPDATE action with the list of Pets received, when this action resolves.
 * If the call fails, dispatch FAIL_ENTITIES action
 */
export const updatePetEntitiesFromApi = createAction(ACTION_UPDATE_ENTITIES_FROM_API, asyncProps<FromApiActionPayload<Pet[]> & { ids: string[] }>());

/**
 * Action to put global status of the store in a pending state. Call UPSERT action with the list of Pets received, when this action resolves.
 * If the call fails, dispatch FAIL_ENTITIES action
 */
export const upsertPetEntitiesFromApi = createAction(ACTION_UPSERT_ENTITIES_FROM_API, asyncProps<FromApiActionPayload<Pet[]>>());

/**
 * Action to put the global status of the store in a pending state. Call REMOVE action with the list of id received, when this action resolves.
 * If the call fails, dispatch FAIL_ENTITIES action
 */
export const removePetEntitiesFromApi = createAction(ACTION_REMOVE_ENTITIES_FROM_API, asyncProps<FromApiActionPayload<string[]>>());
