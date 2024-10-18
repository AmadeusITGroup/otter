import {createFeatureSelector, createSelector} from '@ngrx/store';
import {routingGuardAdapter} from './routing-guard.reducer';
import {RegisteredItemFailureReason, RegisteredItemStatus, ROUTING_GUARD_STORE_NAME, RoutingGuardState} from './routing-guard.state';

const {selectIds, selectEntities, selectAll, selectTotal} = routingGuardAdapter.getSelectors();

/** Select RoutingGuard State */
export const selectRoutingGuardState = createFeatureSelector<RoutingGuardState>(ROUTING_GUARD_STORE_NAME);

/** Select the array of RoutingGuard ids */
export const selectRoutingGuardIds = createSelector(selectRoutingGuardState, selectIds);

/** Select the array of RoutingGuard */
export const selectAllRoutingGuard = createSelector(selectRoutingGuardState, selectAll);

/** Select the dictionary of RoutingGuard entities */
export const selectRoutingGuardEntities = createSelector(selectRoutingGuardState, selectEntities);

/** Select the total RoutingGuard count */
export const selectRoutingGuardTotal = createSelector(selectRoutingGuardState, selectTotal);

/**
 * Selector used to retrieve the list of entities' status
 */
export const selectRoutingGuardEntitiesStatusList = createSelector(
  selectRoutingGuardState,
  (state: RoutingGuardState) => {
    return Object.keys(state.entities)
      .filter((key) => !!state.entities[key])
      .map((key) => state.entities[key]!.status);
  }
);

/**
 * Selector used to retrieve the list of entities' blocking reasons for FAILURE status.
 */
export const selectRoutingGuardEntitiesBlockingReasons = createSelector(
  selectRoutingGuardState,
  (state: RoutingGuardState) => {
    return Object.values(state.entities)
      .filter((entity) => !!entity && !!entity.blockingReason)
      .map((entity) => entity!.blockingReason!);
  }
);

/**
 * Selector used to check that no item is in PENDING state.
 * For example, we will rely on this selector to trigger the canDeactivate logic in the RoutingGuard
 */
export const hasNoEntitiesInPendingState = createSelector(
  selectRoutingGuardEntitiesStatusList,
  (statusList: string[]) => {
    return !statusList.includes(RegisteredItemStatus.PENDING);
  }
);

/**
 * Selector used to check that no item is in FAILURE state.
 * For example, we will rely on this selector to authorize or not the navigation in the RoutingGuard
 */
export const hasNoEntitiesInFailureState = createSelector(
  selectRoutingGuardEntitiesStatusList,
  (statusList: string[]) => {
    return !statusList.includes(RegisteredItemStatus.FAILURE);
  }
);

/**
 * Selector used to check that no item is in READY or FAILURE state.
 * For example, we will rely on this selector to trigger the router navigation and display a loader
 */
export const hasNoEntityInReadyOrFailureState = createSelector(
  selectRoutingGuardEntitiesStatusList,
  (statusList: string[]) => {
    return !statusList.some((status) => status === RegisteredItemStatus.READY || status === RegisteredItemStatus.FAILURE);
  }
);

/**
 * Selector used to check that no item is in FAILURE state with a blocking reason provided.
 * Takes `blockingReason: RegisteredItemFailureReason` as aproperty parameter.
 */
export const hasNoEntityFailureStateWithReasons = createSelector(
  selectRoutingGuardEntitiesBlockingReasons,
  (reasons: RegisteredItemFailureReason[], properties: { blockingReason: RegisteredItemFailureReason }) => {
    return !reasons.includes(properties.blockingReason);
  }
);
