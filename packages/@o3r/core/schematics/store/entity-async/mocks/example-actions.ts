export const asyncEntityActionsContent = `import {
  asyncProps,
  AsyncRequest,
  FromApiActionPayload,
  SetAsyncStoreItemEntitiesActionPayload,
  UpdateAsyncStoreItemEntitiesActionPayloadWithId,
  FailAsyncStoreItemEntitiesActionPayload,
  SetActionPayload,
  UpdateActionPayload
} from '@o3r/core';
import {Example} from '@api/sdk';
import { createAction, props } from '@ngrx/store';
import {ExampleStateDetails} from './example.state';

/** StateDetailsActions */
const ACTION_SET = '[Example] set';
const ACTION_UPDATE = '[Example] update';
const ACTION_RESET = '[Example] reset';
const ACTION_CANCEL_REQUEST = '[Example] cancel request';

/** Entity Actions */
const ACTION_CLEAR_ENTITIES = '[Example] clear entities';
const ACTION_UPDATE_ENTITIES = '[Example] update entities';
const ACTION_UPSERT_ENTITIES = '[Example] upsert entities';
const ACTION_SET_ENTITIES = '[Example] set entities';
const ACTION_FAIL_ENTITIES = '[Example] fail entities';

/** Async Actions */
const ACTION_SET_ENTITIES_FROM_API = '[Example] set entities from api';
const ACTION_UPDATE_ENTITIES_FROM_API = '[Example] update entities from api';
const ACTION_UPSERT_ENTITIES_FROM_API = '[Example] upsert entities from api';

/** Action to clear the StateDetails of the store and replace it */
export const setExample = createAction(ACTION_SET, props<SetActionPayload<ExampleStateDetails>>());

/** Action to change a part or the whole object in the store. */
export const updateExample = createAction(ACTION_UPDATE, props<UpdateActionPayload<ExampleStateDetails>>());

/** Action to reset the whole state, by returning it to initial state. */
export const resetExample = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelExampleRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/** Action to clear all example and fill the store with the payload */
export const setExampleEntities  = createAction(ACTION_SET_ENTITIES, props<SetAsyncStoreItemEntitiesActionPayload<Example>>());

/** Action to update example with known IDs, ignore the new ones */
export const updateExampleEntities = createAction(ACTION_UPDATE_ENTITIES, props<UpdateAsyncStoreItemEntitiesActionPayloadWithId<Example>>());

/** Action to update example with known IDs, insert the new ones */
export const upsertExampleEntities = createAction(ACTION_UPSERT_ENTITIES, props<SetAsyncStoreItemEntitiesActionPayload<Example>>());

/** Action to empty the list of entities, keeping the global state */
export const clearExampleEntities = createAction(ACTION_CLEAR_ENTITIES);

/** Action to update failureStatus for every Example */
export const failExampleEntities = createAction(ACTION_FAIL_ENTITIES, props<FailAsyncStoreItemEntitiesActionPayload<any>>());

/**
 * Action to put the global status of the store in a pending state. Call SET action with the list of Examples received, when this action resolves.
 * If the call fails, dispatch FAIL_ENTITIES action
 */
export const setExampleEntitiesFromApi = createAction(ACTION_SET_ENTITIES_FROM_API, asyncProps<FromApiActionPayload<Example[]>>());

/**
 * Action to change isPending status of elements to be updated with a request. Call UPDATE action with the list of Examples received, when this action resolves.
 * If the call fails, dispatch FAIL_ENTITIES action
 */
export const updateExampleEntitiesFromApi = createAction(ACTION_UPDATE_ENTITIES_FROM_API, asyncProps<FromApiActionPayload<Example[]> & { ids: string[] }>());

/**
 * Action to put global status of the store in a pending state. Call UPSERT action with the list of Examples received, when this action resolves.
 * If the call fails, dispatch FAIL_ENTITIES action
 */
export const upsertExampleEntitiesFromApi = createAction(ACTION_UPSERT_ENTITIES_FROM_API, asyncProps<FromApiActionPayload<Example[]>>());

`;
