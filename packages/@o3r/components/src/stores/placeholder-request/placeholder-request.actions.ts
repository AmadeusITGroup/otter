import {
  createAction,
  props,
} from '@ngrx/store';
import {
  asyncProps,
  AsyncRequest,
  FailAsyncStoreItemEntitiesActionPayload,
  FromApiActionPayload,
  UpdateAsyncStoreItemEntityActionPayloadWithId,
  UpdateEntityActionPayloadWithId,
} from '@o3r/core';
import {
  PlaceholderRequestModel,
  PlaceholderRequestReply,
} from './placeholder-request.state';

const ACTION_FAIL_ENTITIES = '[PlaceholderRequest] fail entities';
const ACTION_SET_ENTITY_FROM_URL = '[PlaceholderRequest] set entity from url';
const ACTION_CANCEL_REQUEST = '[PlaceholderRequest] cancel request';
const ACTION_UPDATE_ENTITY = '[PlaceholderRequest] update entity';
const ACTION_UPDATE_ENTITY_SYNC = '[PlaceholderRequest] update entity sync';

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelPlaceholderRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest & { id: string }>());

/** Action to update failureStatus for PlaceholderRequestModels */
export const failPlaceholderRequestEntity = createAction(ACTION_FAIL_ENTITIES, props<FailAsyncStoreItemEntitiesActionPayload<any>>());

/** Action to update an entity */
export const updatePlaceholderRequestEntity = createAction(ACTION_UPDATE_ENTITY, props<UpdateAsyncStoreItemEntityActionPayloadWithId<PlaceholderRequestModel>>());

/** Action to update an entity without impact on request id */
export const updatePlaceholderRequestEntitySync = createAction(ACTION_UPDATE_ENTITY_SYNC, props<UpdateEntityActionPayloadWithId<PlaceholderRequestModel>>());

/** Action to update PlaceholderRequest with known IDs, will create the entity with only the url, the call will be created in the effect */
export const setPlaceholderRequestEntityFromUrl = createAction(ACTION_SET_ENTITY_FROM_URL, asyncProps<FromApiActionPayload<PlaceholderRequestReply> & { resolvedUrl: string; id: string }>());
