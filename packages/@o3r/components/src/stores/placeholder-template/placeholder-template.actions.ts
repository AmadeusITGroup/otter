import { createAction, props } from '@ngrx/store';
import { asyncProps, AsyncRequest, FailAsyncStoreItemEntitiesActionPayload, FromApiActionPayload, SetAsyncStoreItemEntityActionPayload } from '@o3r/core';
import { PlaceholderTemplateModel, PlaceholderTemplateReply } from './placeholder-template.state';

const ACTION_CANCEL_REQUEST = '[PlaceholderTemplate] cancel request';
const ACTION_DELETE_ENTITY = '[PlaceholderTemplate] delete entity';
const ACTION_SET_ENTITY = '[PlaceholderTemplate] set entity';
const ACTION_FAIL_ENTITIES = '[PlaceholderTemplate] fail entities';
const ACTION_UPSERT_ENTITY_FROM_URL = '[PlaceholderTemplate] upsert from url';

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelPlaceholderTemplateRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest & {id : string}>());

/** Action to delete a specific entity */
export const deletePlaceholderTemplateEntity = createAction(ACTION_DELETE_ENTITY, asyncProps<FromApiActionPayload<void> & {id : string}>());

/** Action to clear all placeholderTemplate and fill the store with the payload */
export const setPlaceholderTemplateEntity = createAction(ACTION_SET_ENTITY, props<SetAsyncStoreItemEntityActionPayload<PlaceholderTemplateModel>>());

/** Action to update failureStatus for every PlaceholderTemplateModel */
export const failPlaceholderTemplateEntity = createAction(ACTION_FAIL_ENTITIES, props<FailAsyncStoreItemEntitiesActionPayload<any>>());

/** Action to update placeholderTemplate with known IDs, will create the entity with only the url, the call will be created in the effect */
export const setPlaceholderTemplateEntityFromUrl =
  createAction(ACTION_UPSERT_ENTITY_FROM_URL, asyncProps<FromApiActionPayload<PlaceholderTemplateReply> & { id: string; url: string; resolvedUrl: string }>());
