import * as selectors from './routing-guard.selectors';
import {
  RegisteredItemFailureReason,
  RegisteredItemStatus,
  RoutingGuardState,
} from './routing-guard.state';

describe('RoutingGuard Selectors tests', () => {
  it('selectRoutingGuardEntitiesStatusList should return the list of entities\' status', () => {
    const state: RoutingGuardState = {
      ids: ['1', '2', '3'],
      entities: {
        ['1']: { id: '1', status: RegisteredItemStatus.READY },
        ['2']: { id: '2', status: RegisteredItemStatus.SUCCESS },
        ['3']: { id: '3', status: RegisteredItemStatus.FAILURE }
      }
    };

    expect(selectors.selectRoutingGuardEntitiesStatusList.projector(state)).toEqual([RegisteredItemStatus.READY, RegisteredItemStatus.SUCCESS, RegisteredItemStatus.FAILURE]);
  });

  it('hasNoEntitiesInPendingState should return true if there\'s no entities in PENDING state', () => {
    let statusList: string[] = [RegisteredItemStatus.READY, RegisteredItemStatus.SUCCESS, RegisteredItemStatus.FAILURE];

    expect((selectors.hasNoEntitiesInPendingState.projector as any)(statusList)).toBeTruthy();
    statusList = [RegisteredItemStatus.PENDING, RegisteredItemStatus.SUCCESS, RegisteredItemStatus.FAILURE];

    expect((selectors.hasNoEntitiesInPendingState.projector as any)(statusList)).toBeFalsy();
  });

  it('hasNoEntitiesInFailureState should return true if there\'s no entities in FAILURE state', () => {
    let statusList: string[] = [RegisteredItemStatus.PENDING, RegisteredItemStatus.PENDING, RegisteredItemStatus.SUCCESS];

    expect((selectors.hasNoEntitiesInFailureState.projector as any)(statusList)).toBeTruthy();
    statusList = [RegisteredItemStatus.SUCCESS, RegisteredItemStatus.FAILURE, RegisteredItemStatus.SUCCESS];

    expect((selectors.hasNoEntitiesInFailureState.projector as any)(statusList)).toBeFalsy();
  });

  it('hasNoEntityInReadyOrFailureState should return true if there\'s no entities in READY or FAILURE state', () => {
    let statusList: string[] = [RegisteredItemStatus.PENDING, RegisteredItemStatus.SUCCESS];

    expect((selectors.hasNoEntityInReadyOrFailureState.projector as any)(statusList)).toBeTruthy();
    statusList = [RegisteredItemStatus.PENDING, RegisteredItemStatus.READY];

    expect((selectors.hasNoEntityInReadyOrFailureState.projector as any)(statusList)).toBeFalsy();
    statusList = [RegisteredItemStatus.PENDING, RegisteredItemStatus.FAILURE];

    expect((selectors.hasNoEntityInReadyOrFailureState.projector as any)(statusList)).toBeFalsy();
  });

  it('hasNoEntityFailureDueToUnsavedForm should return true if there\'s no entities Failure due to the blocking reason provided', () => {
    let reasons: (string | undefined)[] = [undefined, RegisteredItemFailureReason.ASYNC_CALL_FAILURE];

    expect((selectors.hasNoEntityFailureStateWithReasons.projector as any)(reasons, { blockingReason: RegisteredItemFailureReason.ASYNC_CALL_FAILURE })).toBeFalsy();
    expect((selectors.hasNoEntityFailureStateWithReasons.projector as any)(reasons, { blockingReason: RegisteredItemFailureReason.FORM_UNSAVED })).toBeTruthy();
    reasons = [undefined, undefined];

    expect((selectors.hasNoEntityFailureStateWithReasons.projector as any)(reasons, { blockingReason: RegisteredItemFailureReason.ASYNC_CALL_FAILURE })).toBeTruthy();
    expect((selectors.hasNoEntityFailureStateWithReasons.projector as any)(reasons, { blockingReason: RegisteredItemFailureReason.FORM_UNSAVED })).toBeTruthy();
    reasons = [undefined, RegisteredItemFailureReason.FORM_UNSAVED];

    expect((selectors.hasNoEntityFailureStateWithReasons.projector as any)(reasons, { blockingReason: RegisteredItemFailureReason.ASYNC_CALL_FAILURE })).toBeTruthy();
    expect((selectors.hasNoEntityFailureStateWithReasons.projector as any)(reasons, { blockingReason: RegisteredItemFailureReason.FORM_UNSAVED })).toBeFalsy();
    reasons = [RegisteredItemFailureReason.FORM_UNSAVED, RegisteredItemFailureReason.ASYNC_CALL_FAILURE];

    expect((selectors.hasNoEntityFailureStateWithReasons.projector as any)(reasons, { blockingReason: RegisteredItemFailureReason.ASYNC_CALL_FAILURE })).toBeFalsy();
    expect((selectors.hasNoEntityFailureStateWithReasons.projector as any)(reasons, { blockingReason: RegisteredItemFailureReason.FORM_UNSAVED })).toBeFalsy();
  });
});
