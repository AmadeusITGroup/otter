import {
  createAction,
  props
} from '@ngrx/store';
import {
  RegisteredItemFailureReason
} from './routing-guard.state';

/** Entity Actions */
const ACTION_REGISTER_ENTITY = '[RoutingGuard] register an entity';
const ACTION_SET_ENTITY_AS_FAILURE = '[RoutingGuard] set an entity state as FAILURE';
const ACTION_SET_ENTITY_AS_SUCCESS_AND_CLEAR_REASON = '[RoutingGuard] set an entity state as SUCCESS and clear reason';
const ACTION_SET_ENTITY_AS_PENDING = '[RoutingGuard] set an entity state as PENDING';
const ACTION_CLEAR_ENTITIES = '[RoutingGuard] clear entities';
const ACTION_CLEAR_FAILURE_REASON = '[RoutingGuard] clear failure reason for an entity';
const ACTION_SET_ENTITY_AS_FAILURE_WITH_REASON = '[RoutingGuard] set an entity state as FAILURE with a reason';

export interface RoutingGuardActionPayload {
  /** Id of the block instance */
  id: string;
}

export interface RoutingGuardFailureReasonPayload {
  /** Id of the block instance */
  id: string;
  /** Reason for failure */
  reason: RegisteredItemFailureReason;
}

/**
 * Register a new entity in routing guard store
 */
export const registerRoutingGuardEntity = createAction(ACTION_REGISTER_ENTITY, props<RoutingGuardActionPayload>());

/**
 * Set an entity in FAILURE status
 */
export const setRoutingGuardEntityAsFailure = createAction(ACTION_SET_ENTITY_AS_FAILURE, props<RoutingGuardActionPayload>());

/**
 * Set an entity in SUCCESS status and clear the reason
 */
export const setRoutingGuardEntityAsSuccessAndClearReason = createAction(ACTION_SET_ENTITY_AS_SUCCESS_AND_CLEAR_REASON, props<RoutingGuardActionPayload>());

/**
 * Set an entity in PENDING status
 */
export const setRoutingGuardEntityAsPending = createAction(ACTION_SET_ENTITY_AS_PENDING, props<RoutingGuardActionPayload>());

/**
 * Clear only the entities, keeps the other attributes in the state
 */
export const clearRoutingGuardEntities = createAction(ACTION_CLEAR_ENTITIES);

/**
 * Clear only the entities, keeps the other attributes in the state
 */
export const clearRoutingGuardEntitiesFailureReason = createAction(ACTION_CLEAR_FAILURE_REASON, props<RoutingGuardActionPayload>());

/**
 * Set entity in FAILURE status with a reason
 */
export const setRoutingGuardEntityFailureWithReason = createAction(ACTION_SET_ENTITY_AS_FAILURE_WITH_REASON, props<RoutingGuardFailureReasonPayload>());
