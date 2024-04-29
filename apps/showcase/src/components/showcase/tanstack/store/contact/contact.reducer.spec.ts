import * as actions from './contact.actions';
import {contactInitialState, contactReducer} from './contact.reducer';
import {ContactState} from './contact.state';

describe('Contact Store reducer', () => {

  let entitiesState: ContactState;
  const firstContact: any = {id: 'contact1', genericItems: []};
  const secondContact: any = {id: 'contact2', genericItems: []};
  const contactReply: any = [firstContact];

  it('should have the correct initial state', () => {
    expect(contactInitialState.ids.length).toBe(0);
  });


  it('should by default return the initial state', () => {
    const state = contactReducer(contactInitialState, {type: 'fake'} as any);
    expect(state).toEqual(contactInitialState);
  });

  describe('Actions on state details', () => {
    beforeEach(() => {
      entitiesState = contactReducer(contactInitialState, actions.setContactEntities({entities: [firstContact, secondContact]}));
    });

    it('SET action should clear current state details and return a state with the new one', () => {
      const firstState = contactReducer(entitiesState, actions.setContact({stateDetails: {requestIds: []}}));
      const secondState = contactReducer(firstState, actions.setContact({stateDetails: {requestIds: [], isPending: false}}));
      expect(secondState.isPending).toEqual(false);
    });

    it('UPDATE should update the state details without modifying entities', () => {
      const firstState = contactReducer(entitiesState, actions.setContact({stateDetails: {requestIds: []}}));
      const secondState = contactReducer(firstState, actions.updateContact({stateDetails: {isPending: false}}));
      expect(secondState.isPending).toEqual(false);
    });

    it('RESET action should return initial state', () => {
      const state = contactReducer(entitiesState, actions.resetContact());
      expect(state).toEqual(contactInitialState);
    });

    it('FAIL action should update the isPending to false and the isFailure to true', () => {
      const state = contactReducer({...contactInitialState, isPending: true}, actions.failContactEntities({}));
      expect(state.ids.length).toBe(0);
      expect(state.isPending).toBe(false);
      expect(state.isFailure).toBe(true);
    });
  });

  describe('Entity actions', () => {
    it('SET_ENTITIES action should clear current entities and set new ones', () => {
      const firstState = contactReducer(contactInitialState, actions.setContactEntities({entities: [firstContact]}));
      const secondState = contactReducer(firstState, actions.setContactEntities({entities: [secondContact]}));
      expect(secondState.ids.length).toEqual(1);
      expect((secondState.ids as string[]).find((id) => (id === firstContact.id))).toBeUndefined();
      expect((secondState.ids as string[]).find((id) => (id === secondContact.id))).toBeDefined();
    });

    it('UPDATE_ENTITTIES action should only update existing entities', () => {
      const firstContactUpdated = {...firstContact, genericField: 'genericId'};
      const firstState = contactReducer(contactInitialState, actions.setContactEntities({entities: [firstContact]}));
      const secondState = contactReducer(firstState,
        actions.updateContactEntities({entities: [firstContactUpdated, secondContact]}));
      expect(secondState.ids.length).toEqual(1);
      expect((secondState.ids as string[]).find((id) => (id === firstContact.id))).toBeDefined();
      expect((secondState.ids as string[]).find((id) => (id === secondContact.id))).toBeUndefined();
    });

    it('UPSERT_ENTITIES action should update existing entities and add the new ones', () => {
      const firstContactUpdated = {...firstContact, genericField: 'genericId'};
      const firstState = contactReducer(contactInitialState, actions.setContactEntities({entities: [firstContact]}));
      const secondState = contactReducer(firstState,
        actions.upsertContactEntities({entities: [firstContactUpdated, secondContact]}));
      expect(secondState.ids.length).toEqual(2);
      expect((secondState.ids as string[]).find((id) => (id === firstContact.id))).toBeDefined();
      expect((secondState.ids as string[]).find((id) => (id === secondContact.id))).toBeDefined();
    });

    it('CLEAR_ENTITIES action should clear only the entities', () => {
      const firstState = contactReducer(contactInitialState, actions.setContactEntities({entities: [firstContact, secondContact]}));
      const secondState = contactReducer(firstState, actions.setContact({stateDetails: {requestIds: [], isPending: false}}));
      const thirdState = contactReducer(secondState, actions.clearContactEntities());
      expect(thirdState.ids.length).toEqual(0);
    });

    it('FAIL_ENTITIES action should update the isPending to false and the isFailure to true', () => {
      const state = contactReducer({...contactInitialState, isPending: true}, actions.failContactEntities({}));
      expect(state.ids.length).toBe(0);
      expect(state.isPending).toBe(false);
      expect(state.isFailure).toBe(true);
    });

    it('FAIL_ENTITIES action should update the global isPending to false in case there are some newIds in the payload', () => {
      const firstState = contactReducer(contactInitialState, actions.setContactEntities({entities: [firstContact]}));
      const secondState = contactReducer({...firstState, isPending : true},
        actions.failContactEntities({error: 'dummy error', ids: [secondContact.id]}));
      expect(secondState.isPending).toBe(false);
      expect(secondState.isFailure).toBe(true);
    });
  });

  describe('API call actions', () => {
    it('SET_ENTITIES_FROM_API action should clear current entities and set new ones', () => {
      const firstState = contactReducer(contactInitialState, actions.setContactEntitiesFromApi({call: Promise.resolve(contactReply), requestId: 'test'}));
      expect(firstState.isPending).toEqual(true);
    });
    it('UPDATE_ENTITIES_FROM_API action should clear current entities and set new ones', () => {
      const firstState = contactReducer(contactInitialState, actions.setContactEntities({entities: [firstContact]}));
      const secondState = contactReducer(firstState,
        actions.updateContactEntitiesFromApi({call: Promise.resolve(contactReply), ids: [firstContact.id], requestId: 'test'}));
      expect(secondState.isPending).toBeFalsy();
      expect(secondState.entities[firstContact.id]!.isPending).toEqual(true);
    });
    it('UPSERT_ENTITIES_FROM_API action should clear current entities and set new ones', () => {
      const firstState = contactReducer(contactInitialState, actions.upsertContactEntitiesFromApi({call: Promise.resolve(contactReply), requestId: 'test'}));
      expect(firstState.isPending).toEqual(true);
    });
  });
});
