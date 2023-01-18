import * as actions from './shopping-cart.actions';
import {shoppingCartInitialState, shoppingCartReducer} from './shopping-cart.reducer';
import {ShoppingCartState} from './shopping-cart.state';

describe('ShoppingCart Store reducer', () => {

  let entitiesState: ShoppingCartState;
  const firstShoppingCart: any = {id: 'shoppingCart1', genericItems: []};
  const secondShoppingCart: any = {id: 'shoppingCart2', genericItems: []};
  const shoppingCartReply: any = [firstShoppingCart];

  it('should have the correct initial state', () => {
    expect(shoppingCartInitialState.ids.length).toBe(0);
  });


  it('should by default return the initial state', () => {
    const state = shoppingCartReducer(shoppingCartInitialState, {type: 'fake'} as any);
    expect(state).toEqual(shoppingCartInitialState);
  });

  describe('Actions on state details ', () => {
    beforeEach(() => {
      entitiesState = shoppingCartReducer(shoppingCartInitialState, actions.setShoppingCartEntities({entities: [firstShoppingCart, secondShoppingCart]}));
    });

    it('SET action should clear current state details and return a state with the new one', () => {
      const firstState = shoppingCartReducer(entitiesState, actions.setShoppingCart({stateDetails: {requestIds: [], selectedCartId: null}}));
      const secondState = shoppingCartReducer(firstState, actions.setShoppingCart({stateDetails: {requestIds: [], selectedCartId: null, isPending: false}}));
      expect(secondState.isPending).toEqual(false);
    });

    it('UPDATE should update the state details without modifying entities', () => {
      const firstState = shoppingCartReducer(entitiesState, actions.setShoppingCart({stateDetails: {requestIds: [], selectedCartId: null}}));
      const secondState = shoppingCartReducer(firstState, actions.updateShoppingCart({stateDetails: {isPending: false}}));
      expect(secondState.isPending).toEqual(false);
    });

    it('RESET action should return initial state', () => {
      const state = shoppingCartReducer(entitiesState, actions.resetShoppingCart());
      expect(state).toEqual(shoppingCartInitialState);
    });

    it('FAIL action should update the isPending to false and the isFailure to true', () => {
      const state = shoppingCartReducer({...shoppingCartInitialState, isPending: true}, actions.failShoppingCartEntities({}));
      expect(state.ids.length).toBe(0);
      expect(state.isPending).toBe(false);
      expect(state.isFailure).toBe(true);
    });
  });

  describe('Entity actions', () => {
    it('SET_ENTITIES action should clear current entities and set new ones', () => {
      const firstState = shoppingCartReducer(shoppingCartInitialState, actions.setShoppingCartEntities({entities: [firstShoppingCart]}));
      const secondState = shoppingCartReducer(firstState, actions.setShoppingCartEntities({entities: [secondShoppingCart]}));
      expect(secondState.ids.length).toEqual(1);
      expect((secondState.ids as string[]).find((id) => (id === firstShoppingCart.id))).toBeUndefined();
      expect((secondState.ids as string[]).find((id) => (id === secondShoppingCart.id))).toBeDefined();
    });

    it('UPDATE_ENTITTIES action should only update existing entities', () => {
      const firstShoppingCartUpdated = {...firstShoppingCart, genericField: 'genericId'};
      const firstState = shoppingCartReducer(shoppingCartInitialState, actions.setShoppingCartEntities({entities: [firstShoppingCart]}));
      const secondState = shoppingCartReducer(firstState,
        actions.updateShoppingCartEntities({entities: [firstShoppingCartUpdated, secondShoppingCart]}));
      expect(secondState.ids.length).toEqual(1);
      expect((secondState.ids as string[]).find((id) => (id === firstShoppingCart.id))).toBeDefined();
      expect((secondState.ids as string[]).find((id) => (id === secondShoppingCart.id))).toBeUndefined();
    });

    it('UPSERT_ENTITIES action should update existing entities and add the new ones', () => {
      const firstShoppingCartUpdated = {...firstShoppingCart, genericField: 'genericId'};
      const firstState = shoppingCartReducer(shoppingCartInitialState, actions.setShoppingCartEntities({entities: [firstShoppingCart]}));
      const secondState = shoppingCartReducer(firstState,
        actions.upsertShoppingCartEntities({entities: [firstShoppingCartUpdated, secondShoppingCart]}));
      expect(secondState.ids.length).toEqual(2);
      expect((secondState.ids as string[]).find((id) => (id === firstShoppingCart.id))).toBeDefined();
      expect((secondState.ids as string[]).find((id) => (id === secondShoppingCart.id))).toBeDefined();
    });

    it('CLEAR_ENTITIES action should clear only the entities', () => {
      const firstState = shoppingCartReducer(shoppingCartInitialState, actions.setShoppingCartEntities({entities: [firstShoppingCart, secondShoppingCart]}));
      const secondState = shoppingCartReducer(firstState, actions.setShoppingCart({stateDetails: {requestIds: [], selectedCartId: null, isPending: false}}));
      const thirdState = shoppingCartReducer(secondState, actions.clearShoppingCartEntities());
      expect(thirdState.ids.length).toEqual(0);
    });

    it('FAIL_ENTITIES action should update the isPending to false and the isFailure to true', () => {
      const state = shoppingCartReducer({...shoppingCartInitialState, isPending: true}, actions.failShoppingCartEntities({}));
      expect(state.ids.length).toBe(0);
      expect(state.isPending).toBe(false);
      expect(state.isFailure).toBe(true);
    });

    it('FAIL_ENTITIES action should update the global isPending to false in case there are some newIds in the payload', () => {
      const firstState = shoppingCartReducer(shoppingCartInitialState, actions.setShoppingCartEntities({entities: [firstShoppingCart]}));
      const secondState = shoppingCartReducer({...firstState, isPending : true},
        actions.failShoppingCartEntities({error: 'dummy error', ids: [secondShoppingCart.id]}));
      expect(secondState.isPending).toBe(false);
      expect(secondState.isFailure).toBe(true);
    });
  });

  describe('API call actions', () => {
    it('SET_ENTITIES_FROM_API action should clear current entities and set new ones', () => {
      const firstState = shoppingCartReducer(shoppingCartInitialState, actions.setShoppingCartEntitiesFromApi({call: Promise.resolve(shoppingCartReply), requestId: 'test'}));
      expect(firstState.isPending).toEqual(true);
    });
    it('UPDATE_ENTITIES_FROM_API action should clear current entities and set new ones', () => {
      const firstState = shoppingCartReducer(shoppingCartInitialState, actions.setShoppingCartEntities({entities: [firstShoppingCart]}));
      const secondState = shoppingCartReducer(firstState,
        actions.updateShoppingCartEntitiesFromApi({call: Promise.resolve(shoppingCartReply), ids: [firstShoppingCart.id], requestId: 'test'}));
      expect(secondState.isPending).toBeFalsy();
      expect(secondState.entities[firstShoppingCart.id]!.isPending).toEqual(true);
    });
    it('UPSERT_ENTITIES_FROM_API action should clear current entities and set new ones', () => {
      const firstState = shoppingCartReducer(shoppingCartInitialState, actions.upsertShoppingCartEntitiesFromApi({call: Promise.resolve(shoppingCartReply), requestId: 'test'}));
      expect(firstState.isPending).toEqual(true);
    });
  });
});
