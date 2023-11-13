import * as actions from './pet.actions';
import {petInitialState, petReducer} from './pet.reducer';
import {PetState} from './pet.state';

describe('Pet Store reducer', () => {

  let entitiesState: PetState;
  const firstPet: any = {name: 'pet1', genericItems: []};
  const secondPet: any = {name: 'pet2', genericItems: []};
  const petReply: any = [firstPet];

  it('should have the correct initial state', () => {
    expect(petInitialState.ids.length).toBe(0);
  });


  it('should by default return the initial state', () => {
    const state = petReducer(petInitialState, {type: 'fake'} as any);
    expect(state).toEqual(petInitialState);
  });

  describe('Actions on state details', () => {
    beforeEach(() => {
      entitiesState = petReducer(petInitialState, actions.setPetEntities({entities: [firstPet, secondPet]}));
    });

    it('SET action should clear current state details and return a state with the new one', () => {
      const firstState = petReducer(entitiesState, actions.setPet({stateDetails: {requestIds: []}}));
      const secondState = petReducer(firstState, actions.setPet({stateDetails: {requestIds: [], isPending: false}}));
      expect(secondState.isPending).toEqual(false);
    });

    it('UPDATE should update the state details without modifying entities', () => {
      const firstState = petReducer(entitiesState, actions.setPet({stateDetails: {requestIds: []}}));
      const secondState = petReducer(firstState, actions.updatePet({stateDetails: {isPending: false}}));
      expect(secondState.isPending).toEqual(false);
    });

    it('RESET action should return initial state', () => {
      const state = petReducer(entitiesState, actions.resetPet());
      expect(state).toEqual(petInitialState);
    });

    it('FAIL action should update the isPending to false and the isFailure to true', () => {
      const state = petReducer({...petInitialState, isPending: true}, actions.failPetEntities({}));
      expect(state.ids.length).toBe(0);
      expect(state.isPending).toBe(false);
      expect(state.isFailure).toBe(true);
    });
  });

  describe('Entity actions', () => {
    it('SET_ENTITIES action should clear current entities and set new ones', () => {
      const firstState = petReducer(petInitialState, actions.setPetEntities({entities: [firstPet]}));
      const secondState = petReducer(firstState, actions.setPetEntities({entities: [secondPet]}));
      expect(secondState.ids.length).toEqual(1);
      expect((secondState.ids as string[]).find((id) => (id === firstPet.name))).toBeUndefined();
      expect((secondState.ids as string[]).find((id) => (id === secondPet.name))).toBeDefined();
    });

    it('UPDATE_ENTITTIES action should only update existing entities', () => {
      const firstPetUpdated = {...firstPet, genericField: 'genericId'};
      const firstState = petReducer(petInitialState, actions.setPetEntities({entities: [firstPet]}));
      const secondState = petReducer(firstState,
        actions.updatePetEntities({entities: [firstPetUpdated, secondPet]}));
      expect(secondState.ids.length).toEqual(1);
      expect((secondState.ids as string[]).find((id) => (id === firstPet.name))).toBeDefined();
      expect((secondState.ids as string[]).find((id) => (id === secondPet.name))).toBeUndefined();
    });

    it('UPSERT_ENTITIES action should update existing entities and add the new ones', () => {
      const firstPetUpdated = {...firstPet, genericField: 'genericId'};
      const firstState = petReducer(petInitialState, actions.setPetEntities({entities: [firstPet]}));
      const secondState = petReducer(firstState,
        actions.upsertPetEntities({entities: [firstPetUpdated, secondPet]}));
      expect(secondState.ids.length).toEqual(2);
      expect((secondState.ids as string[]).find((id) => (id === firstPet.name))).toBeDefined();
      expect((secondState.ids as string[]).find((id) => (id === secondPet.name))).toBeDefined();
    });

    it('CLEAR_ENTITIES action should clear only the entities', () => {
      const firstState = petReducer(petInitialState, actions.setPetEntities({entities: [firstPet, secondPet]}));
      const secondState = petReducer(firstState, actions.setPet({stateDetails: {requestIds: [], isPending: false}}));
      const thirdState = petReducer(secondState, actions.clearPetEntities());
      expect(thirdState.ids.length).toEqual(0);
    });

    it('FAIL_ENTITIES action should update the isPending to false and the isFailure to true', () => {
      const state = petReducer({...petInitialState, isPending: true}, actions.failPetEntities({}));
      expect(state.ids.length).toBe(0);
      expect(state.isPending).toBe(false);
      expect(state.isFailure).toBe(true);
    });

    it('FAIL_ENTITIES action should update the global isPending to false in case there are some newIds in the payload', () => {
      const firstState = petReducer(petInitialState, actions.setPetEntities({entities: [firstPet]}));
      const secondState = petReducer({...firstState, isPending : true},
        actions.failPetEntities({error: 'dummy error', ids: [secondPet.id]}));
      expect(secondState.isPending).toBe(false);
      expect(secondState.isFailure).toBe(true);
    });
  });

  describe('API call actions', () => {
    it('SET_ENTITIES_FROM_API action should clear current entities and set new ones', () => {
      const firstState = petReducer(petInitialState, actions.setPetEntitiesFromApi({call: Promise.resolve(petReply), requestId: 'test'}));
      expect(firstState.isPending).toEqual(true);
    });
    it('UPDATE_ENTITIES_FROM_API action should clear current entities and set new ones', () => {
      const firstState = petReducer(petInitialState, actions.setPetEntities({entities: [firstPet]}));
      const secondState = petReducer(firstState,
        actions.updatePetEntitiesFromApi({call: Promise.resolve(petReply), ids: [firstPet.name], requestId: 'test'}));
      expect(secondState.isPending).toBeFalsy();
      expect(secondState.entities[firstPet.name]!.isPending).toEqual(true);
    });
    it('UPSERT_ENTITIES_FROM_API action should clear current entities and set new ones', () => {
      const firstState = petReducer(petInitialState, actions.upsertPetEntitiesFromApi({call: Promise.resolve(petReply), requestId: 'test'}));
      expect(firstState.isPending).toEqual(true);
    });
  });
});
