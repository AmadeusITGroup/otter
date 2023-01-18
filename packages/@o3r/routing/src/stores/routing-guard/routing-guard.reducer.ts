import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';
import {ActionCreator, createReducer, on, ReducerTypes} from '@ngrx/store';
import * as actions from './routing-guard.actions';
import {RegisteredItemStatus, RoutingGuardModel, RoutingGuardState} from './routing-guard.state';

/**
 * RoutingGuard Store adapter
 */
export const routingGuardAdapter: EntityAdapter<RoutingGuardModel> = createEntityAdapter<RoutingGuardModel>({
  selectId: (model) => model.id
});

/**
 * RoutingGuard Store initial value
 */
export const routingGuardInitialState: RoutingGuardState = routingGuardAdapter.getInitialState({});

/**
 *  List of basic actions for RoutingGuard Store
 */
export const routingGuardReducerFeatures: ReducerTypes<RoutingGuardState, ActionCreator[]>[] = [
  on(actions.registerRoutingGuardEntity, (state, payload) =>
    routingGuardAdapter.addOne({id: payload.id, status: RegisteredItemStatus.READY}, state)),

  on(actions.setRoutingGuardEntityAsPending, (state, payload) =>
    routingGuardAdapter.updateOne({id: payload.id, changes: {status: RegisteredItemStatus.PENDING}}, state)),

  on(actions.setRoutingGuardEntityAsFailure, (state, payload) =>
    routingGuardAdapter.updateOne({id: payload.id, changes: {status: RegisteredItemStatus.FAILURE}}, state)),

  on(actions.setRoutingGuardEntityAsSuccessAndClearReason, (state, payload) =>
    routingGuardAdapter.updateOne({id: payload.id, changes: {status: RegisteredItemStatus.SUCCESS, blockingReason: undefined}}, state)),

  on(actions.clearRoutingGuardEntities, (state) => routingGuardAdapter.removeAll(state)),

  on(actions.clearRoutingGuardEntitiesFailureReason, (state, payload) =>
    routingGuardAdapter.updateOne({id: payload.id, changes: {status: RegisteredItemStatus.READY, blockingReason: undefined}}, state)),

  on(actions.setRoutingGuardEntityFailureWithReason, (state, payload) =>
    routingGuardAdapter.updateOne({id: payload.id, changes: {status: RegisteredItemStatus.FAILURE, blockingReason: payload.reason}}, state))
];

/**
 * RoutingGuard Store reducer
 */
export const routingGuardReducer = createReducer(
  routingGuardInitialState,
  ...routingGuardReducerFeatures
);
