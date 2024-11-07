import {
  createAction,
  props,
} from '@ngrx/store';
import {
  asyncProps,
  AsyncRequest,
  FailAsyncStoreItemEntitiesActionPayload,
  FromApiActionPayload,
  SetActionPayload,
  SetAsyncStoreItemEntitiesActionPayload,
  UpdateActionPayload,
} from '@o3r/core';
import {
  RulesetsModel,
  RulesetsStateDetails,
} from './rulesets.state';

/** StateDetailsActions */
const ACTION_SET = '[Rulesets] set';
const ACTION_UPDATE = '[Rulesets] update';
const ACTION_RESET = '[Rulesets] reset';
const ACTION_CANCEL_REQUEST = '[Rulesets] cancel request';

/** Entity Actions */
const ACTION_CLEAR_ENTITIES = '[Rulesets] clear entities';
const ACTION_UPSERT_ENTITIES = '[Rulesets] upsert entities';
const ACTION_SET_ENTITIES = '[Rulesets] set entities';
const ACTION_FAIL_ENTITIES = '[Rulesets] fail entities';

/** Async Actions */
const ACTION_SET_ENTITIES_FROM_API = '[Rulesets] set entities from api';
const ACTION_UPSERT_ENTITIES_FROM_API = '[Rulesets] upsert entities from api';

/** Action to clear the StateDetails of the store and replace it */
export const setRulesets = createAction(ACTION_SET, props<SetActionPayload<RulesetsStateDetails>>());

/** Action to change a part or the whole object in the store. */
export const updateRulesets = createAction(ACTION_UPDATE, props<UpdateActionPayload<RulesetsStateDetails>>());

/** Action to reset the whole state, by returning it to initial state. */
export const resetRulesets = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelRulesetsRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/** Action to clear all rulesets and fill the store with the payload */
export const setRulesetsEntities = createAction(ACTION_SET_ENTITIES, props<SetAsyncStoreItemEntitiesActionPayload<RulesetsModel>>());

/** Action to update rulesets with known IDs, insert the new ones */
export const upsertRulesetsEntities = createAction(ACTION_UPSERT_ENTITIES, props<SetAsyncStoreItemEntitiesActionPayload<RulesetsModel>>());

/** Action to empty the list of entities, keeping the global state */
export const clearRulesetsEntities = createAction(ACTION_CLEAR_ENTITIES);

/** Action to update failureStatus for every RulesetsModel */
export const failRulesetsEntities = createAction(ACTION_FAIL_ENTITIES, props<FailAsyncStoreItemEntitiesActionPayload<any>>());

/**
 * Action to put the global status of the store in a pending state. Call SET action with the list of RulesetsModels received, when this action resolves.
 * If the call fails, dispatch FAIL_ENTITIES action
 */
export const setRulesetsEntitiesFromApi = createAction(ACTION_SET_ENTITIES_FROM_API, asyncProps<FromApiActionPayload<RulesetsModel[]>>());

/**
 * Action to put global status of the store in a pending state. Call UPSERT action with the list of RulesetsModels received, when this action resolves.
 * If the call fails, dispatch FAIL_ENTITIES action
 */
export const upsertRulesetsEntitiesFromApi = createAction(ACTION_UPSERT_ENTITIES_FROM_API, asyncProps<FromApiActionPayload<RulesetsModel[]>>());
