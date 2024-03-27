import * as actions from './petstore.actions';
import {petstoreInitialState, petstoreReducer} from './petstore.reducer';
import {PetstoreState} from './petstore.state';

describe('Petstore Store reducer', () => {

  let entitiesState: PetstoreState;
  const firstPetstore: any = {id: 'petstore1', genericItems: []};
  const secondPetstore: any = {id: 'petstore2', genericItems: []};
  const petstoreReply: any = [firstPetstore];

  it('should have the correct initial state', () => {
    expect(petstoreInitialState.ids.length).toBe(0);
  });


  it('should by default return the initial state', () => {
    const state = petstoreReducer(petstoreInitialState, {type: 'fake'} as any);
    expect(state).toEqual(petstoreInitialState);
  });

  describe('Actions on state details', () => {
    beforeEach(() => {
      entitiesState = petstoreReducer(petstoreInitialState, actions.setPetstoreEntities({entities: [firstPetstore, secondPetstore]}));
    });

    it('SET action should clear current state details and return a state with the new one', () => {
      const firstState = petstoreReducer(entitiesState, actions.setPetstore({stateDetails: {requestIds: []}}));
      const secondState = petstoreReducer(firstState, actions.setPetstore({stateDetails: {requestIds: [], isPending: false}}));
      expect(secondState.isPending).toEqual(false);
    });

    it('UPDATE should update the state details without modifying entities', () => {
      const firstState = petstoreReducer(entitiesState, actions.setPetstore({stateDetails: {requestIds: []}}));
      const secondState = petstoreReducer(firstState, actions.updatePetstore({stateDetails: {isPending: false}}));
      expect(secondState.isPending).toEqual(false);
    });

    it('RESET action should return initial state', () => {
      const state = petstoreReducer(entitiesState, actions.resetPetstore());
      expect(state).toEqual(petstoreInitialState);
    });

    it('FAIL action should update the isPending to false and the isFailure to true', () => {
      const state = petstoreReducer({...petstoreInitialState, isPending: true}, actions.failPetstoreEntities({}));
      expect(state.ids.length).toBe(0);
      expect(state.isPending).toBe(false);
      expect(state.isFailure).toBe(true);
    });
  });

  describe('Entity actions', () => {
    it('SET_ENTITIES action should clear current entities and set new ones', () => {
      const firstState = petstoreReducer(petstoreInitialState, actions.setPetstoreEntities({entities: [firstPetstore]}));
      const secondState = petstoreReducer(firstState, actions.setPetstoreEntities({entities: [secondPetstore]}));
      expect(secondState.ids.length).toEqual(1);
      expect((secondState.ids as string[]).find((id) => (id === firstPetstore.id))).toBeUndefined();
      expect((secondState.ids as string[]).find((id) => (id === secondPetstore.id))).toBeDefined();
    });

    it('UPDATE_ENTITTIES action should only update existing entities', () => {
      const firstPetstoreUpdated = {...firstPetstore, genericField: 'genericId'};
      const firstState = petstoreReducer(petstoreInitialState, actions.setPetstoreEntities({entities: [firstPetstore]}));
      const secondState = petstoreReducer(firstState,
        actions.updatePetstoreEntities({entities: [firstPetstoreUpdated, secondPetstore]}));
      expect(secondState.ids.length).toEqual(1);
      expect((secondState.ids as string[]).find((id) => (id === firstPetstore.id))).toBeDefined();
      expect((secondState.ids as string[]).find((id) => (id === secondPetstore.id))).toBeUndefined();
    });

    it('UPSERT_ENTITIES action should update existing entities and add the new ones', () => {
      const firstPetstoreUpdated = {...firstPetstore, genericField: 'genericId'};
      const firstState = petstoreReducer(petstoreInitialState, actions.setPetstoreEntities({entities: [firstPetstore]}));
      const secondState = petstoreReducer(firstState,
        actions.upsertPetstoreEntities({entities: [firstPetstoreUpdated, secondPetstore]}));
      expect(secondState.ids.length).toEqual(2);
      expect((secondState.ids as string[]).find((id) => (id === firstPetstore.id))).toBeDefined();
      expect((secondState.ids as string[]).find((id) => (id === secondPetstore.id))).toBeDefined();
    });

    it('CLEAR_ENTITIES action should clear only the entities', () => {
      const firstState = petstoreReducer(petstoreInitialState, actions.setPetstoreEntities({entities: [firstPetstore, secondPetstore]}));
      const secondState = petstoreReducer(firstState, actions.setPetstore({stateDetails: {requestIds: [], isPending: false}}));
      const thirdState = petstoreReducer(secondState, actions.clearPetstoreEntities());
      expect(thirdState.ids.length).toEqual(0);
    });

    it('FAIL_ENTITIES action should update the isPending to false and the isFailure to true', () => {
      const state = petstoreReducer({...petstoreInitialState, isPending: true}, actions.failPetstoreEntities({}));
      expect(state.ids.length).toBe(0);
      expect(state.isPending).toBe(false);
      expect(state.isFailure).toBe(true);
    });

    it('FAIL_ENTITIES action should update the global isPending to false in case there are some newIds in the payload', () => {
      const firstState = petstoreReducer(petstoreInitialState, actions.setPetstoreEntities({entities: [firstPetstore]}));
      const secondState = petstoreReducer({...firstState, isPending : true},
        actions.failPetstoreEntities({error: 'dummy error', ids: [secondPetstore.id]}));
      expect(secondState.isPending).toBe(false);
      expect(secondState.isFailure).toBe(true);
    });
  });

  describe('API call actions', () => {
    it('SET_ENTITIES_FROM_API action should clear current entities and set new ones', () => {
      const firstState = petstoreReducer(petstoreInitialState, actions.setPetstoreEntitiesFromApi({call: Promise.resolve(petstoreReply), requestId: 'test'}));
      expect(firstState.isPending).toEqual(true);
    });
    it('UPDATE_ENTITIES_FROM_API action should clear current entities and set new ones', () => {
      const firstState = petstoreReducer(petstoreInitialState, actions.setPetstoreEntities({entities: [firstPetstore]}));
      const secondState = petstoreReducer(firstState,
        actions.updatePetstoreEntitiesFromApi({call: Promise.resolve(petstoreReply), ids: [firstPetstore.id], requestId: 'test'}));
      expect(secondState.isPending).toBeFalsy();
      expect(secondState.entities[firstPetstore.id]!.isPending).toEqual(true);
    });
    it('UPSERT_ENTITIES_FROM_API action should clear current entities and set new ones', () => {
      const firstState = petstoreReducer(petstoreInitialState, actions.upsertPetstoreEntitiesFromApi({call: Promise.resolve(petstoreReply), requestId: 'test'}));
      expect(firstState.isPending).toEqual(true);
    });
  });
});
