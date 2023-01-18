import {EntityState} from '@ngrx/entity';

/** Identifies the status of a registered block */
export enum RegisteredItemStatus {
  /** block is ready (async call has not been triggered) */
  READY = 'READY',
  /** block is waiting for async call to resolve */
  PENDING = 'PENDING',
  /** block received the async call result and it's a failure */
  FAILURE = 'FAILURE',
  /** block received the async call result and it's a success */
  SUCCESS = 'SUCCESS'
}

/** Identifies the failure reason for the registered block */
export enum RegisteredItemFailureReason {
  /** Routing Failed because the async call result is failure */
  ASYNC_CALL_FAILURE = 'ASYNC_CALL_FAILURE',
  /** Routing failed because the changes to the form has not been saved */
  FORM_UNSAVED = 'FORM_UNSAVED'
}

/**
 * RoutingGuard model
 */
export interface RoutingGuardModel {
  /** Id of the block instance */
  id: string;
  /** Routing status of the block */
  status: RegisteredItemStatus;
  /** Routing Guard blocking reason */
  blockingReason?: RegisteredItemFailureReason;
}

/**
 * RoutingGuard store state
 */
export interface RoutingGuardState extends EntityState<RoutingGuardModel> {}

/**
 * Name of the RoutingGuard Store
 */
export const ROUTING_GUARD_STORE_NAME = 'routingGuard';

/**
 * RoutingGuard Store Interface
 */
export interface RoutingGuardStore {
  /** RoutingGuard state */
  [ROUTING_GUARD_STORE_NAME]: RoutingGuardState;
}
