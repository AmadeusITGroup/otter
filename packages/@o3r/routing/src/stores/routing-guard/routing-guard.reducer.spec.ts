// Disable the `no-unnecessary-type-assertion` rule due to a wrong-positive on ngrx Dictionary type
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import * as actions from './routing-guard.actions';
import { routingGuardInitialState, routingGuardReducer} from './routing-guard.reducer';
import {RegisteredItemFailureReason, RegisteredItemStatus, RoutingGuardState} from './routing-guard.state';

describe('RoutingGuard Store reducer', () => {
  it('should have the correct initial state', () => {
    expect(routingGuardInitialState.ids.length).toBe(0);
  });

  it('should by default return the initial state', () => {
    const state = routingGuardReducer(routingGuardInitialState, {type: 'fake'} as any);

    expect(state).toEqual(routingGuardInitialState);
  });
});

describe('RoutingGuard Entity actions', () => {
  it('ACTION_REGISTER_ENTITY should add a new entity and set its status as READY', () => {
    const payload = {id: 'test'};
    const state = routingGuardReducer(routingGuardInitialState, actions.registerRoutingGuardEntity(payload));

    expect(state.ids.length).toEqual(1);
    expect((state.ids as string[]).find((id) => (id === payload.id))).toBeDefined();
    expect((state.ids as string[]).find((id) => (id === payload.id))).toEqual(payload.id);
    expect(state.entities[payload.id]).toBeDefined();
    expect(state.entities[payload.id]!.status).toEqual(RegisteredItemStatus.READY);
  });

  it('ACTION_SET_ENTITY_AS_FAILURE should set an existing entity status as FAILURE', () => {
    const payload = {id: 'test'};
    const state: RoutingGuardState = {
      ids: [payload.id],
      entities: {
        [payload.id]: {id: payload.id, status: RegisteredItemStatus.READY}
      }
    };
    const newState: RoutingGuardState = routingGuardReducer(state, actions.setRoutingGuardEntityAsFailure(payload));

    expect(newState.ids.length).toEqual(1);
    expect((newState.ids as string[]).find((id) => (id === payload.id))).toBeDefined();
    expect((newState.ids as string[]).find((id) => (id === payload.id))).toEqual(payload.id);
    expect(newState.entities[payload.id]).toBeDefined();
    expect(newState.entities[payload.id]!.status).toEqual(RegisteredItemStatus.FAILURE);
  });

  it('ACTION_SET_ENTITY_AS_SUCCESS_AND_CLEAR_REASON should set existing entities status as SUCCESS and clear the reason', () => {
    const payloadFormUnsaved = {id: 'formunsaved'};
    const payloadAsyncCallFailure = {id: 'asynccallfailure'};
    const payloadNone = {id: 'none'};
    const state: RoutingGuardState = {
      ids: ['formunsaved', 'asynccallfailure', 'none'],
      entities: {
        ['formunsaved']: {id: 'formunsaved', status: RegisteredItemStatus.FAILURE, blockingReason: RegisteredItemFailureReason.FORM_UNSAVED},
        ['asynccallfailure']: {id: 'asynccallfailure', status: RegisteredItemStatus.FAILURE, blockingReason: RegisteredItemFailureReason.ASYNC_CALL_FAILURE},
        ['none']: {id: 'none', status: RegisteredItemStatus.READY}
      }
    };
    const newState1: RoutingGuardState = routingGuardReducer(state, actions.setRoutingGuardEntityAsSuccessAndClearReason(payloadFormUnsaved));

    expect(newState1.ids.length).toEqual(3);
    expect((newState1.ids as string[]).find((id) => (id === payloadFormUnsaved.id))).toBeDefined();
    expect((newState1.ids as string[]).find((id) => (id === payloadFormUnsaved.id))).toEqual(payloadFormUnsaved.id);
    expect(newState1.entities[payloadFormUnsaved.id]).toBeDefined();
    expect(newState1.entities[payloadFormUnsaved.id]!.status).toEqual(RegisteredItemStatus.SUCCESS);
    expect(newState1.entities[payloadFormUnsaved.id]!.blockingReason).toEqual(undefined);

    const newState2: RoutingGuardState = routingGuardReducer(state, actions.setRoutingGuardEntityAsSuccessAndClearReason(payloadAsyncCallFailure));

    expect(newState2.ids.length).toEqual(3);
    expect((newState2.ids as string[]).find((id) => (id === payloadAsyncCallFailure.id))).toBeDefined();
    expect((newState2.ids as string[]).find((id) => (id === payloadAsyncCallFailure.id))).toEqual(payloadAsyncCallFailure.id);
    expect(newState2.entities[payloadAsyncCallFailure.id]).toBeDefined();
    expect(newState2.entities[payloadAsyncCallFailure.id]!.status).toEqual(RegisteredItemStatus.SUCCESS);
    expect(newState2.entities[payloadAsyncCallFailure.id]!.blockingReason).toEqual(undefined);

    const newState3: RoutingGuardState = routingGuardReducer(state, actions.setRoutingGuardEntityAsSuccessAndClearReason(payloadNone));

    expect(newState3.ids.length).toEqual(3);
    expect((newState3.ids as string[]).find((id) => (id === payloadNone.id))).toBeDefined();
    expect((newState3.ids as string[]).find((id) => (id === payloadNone.id))).toEqual(payloadNone.id);
    expect(newState3.entities[payloadNone.id]).toBeDefined();
    expect(newState3.entities[payloadNone.id]!.status).toEqual(RegisteredItemStatus.SUCCESS);
    expect(newState3.entities[payloadNone.id]!.blockingReason).toEqual(undefined);
  });

  it('ACTION_SET_ENTITY_AS_PENDING should set an existing entity status as PENDING', () => {
    const payload = {id: 'test'};
    const state: RoutingGuardState = {
      ids: ['test'],
      entities: {
        ['test']: {id: 'test', status: RegisteredItemStatus.READY}
      }
    };
    const newState: RoutingGuardState = routingGuardReducer(state, actions.setRoutingGuardEntityAsPending(payload));

    expect(newState.ids.length).toEqual(1);
    expect((newState.ids as string[]).find((id) => (id === payload.id))).toBeDefined();
    expect((newState.ids as string[]).find((id) => (id === payload.id))).toEqual(payload.id);
    expect(newState.entities[payload.id]).toBeDefined();
    expect(newState.entities[payload.id]!.status).toEqual(RegisteredItemStatus.PENDING);
  });

  it('ACTION_CLEAR_FAILURE_REASON should set the reason for an existing entity failure as undefined', () => {
    const payload = {id: 'test'};
    const state: RoutingGuardState = {
      ids: ['test'],
      entities: {
        ['test']: {id: 'test', status: RegisteredItemStatus.FAILURE, blockingReason: RegisteredItemFailureReason.FORM_UNSAVED}
      }
    };
    const newState: RoutingGuardState = routingGuardReducer(state, actions.clearRoutingGuardEntitiesFailureReason(payload));

    expect(newState.ids.length).toEqual(1);
    expect((newState.ids as string[]).find((id) => (id === payload.id))).toBeDefined();
    expect((newState.ids as string[]).find((id) => (id === payload.id))).toEqual(payload.id);
    expect(newState.entities[payload.id]).toBeDefined();
    expect(newState.entities[payload.id]!.status).toEqual(RegisteredItemStatus.READY);
    expect(newState.entities[payload.id]!.blockingReason).toEqual(undefined);
  });

  it('ACTION_SET_ENTITY_AS_FAILURE_WITH_REASON should set the entity as failure and a reason for failure', () => {
    const payload = {id: 'test', reason: RegisteredItemFailureReason.FORM_UNSAVED};
    const state: RoutingGuardState = {
      ids: ['test'],
      entities: {
        ['test']: {id: 'test', status: RegisteredItemStatus.READY}
      }
    };
    const newState: RoutingGuardState = routingGuardReducer(state, actions.setRoutingGuardEntityFailureWithReason(payload));

    expect(newState.ids.length).toEqual(1);
    expect((newState.ids as string[]).find((id) => (id === payload.id))).toBeDefined();
    expect((newState.ids as string[]).find((id) => (id === payload.id))).toEqual(payload.id);
    expect(newState.entities[payload.id]).toBeDefined();
    expect(newState.entities[payload.id]!.status).toEqual(RegisteredItemStatus.FAILURE);
    expect(newState.entities[payload.id]!.blockingReason).toEqual(payload.reason);
  });
});
