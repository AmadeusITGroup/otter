export const asyncEntityReducerSpecContent = `import * as actions from './air-offers.actions';
import {airOffersInitialState, airOffersReducer} from './air-offers.reducer';
import {AirOffersState} from './air-offers.state';

describe('AirOffers Store reducer', () => {

  let entitiesState: AirOffersState;
  const firstAirOffers: any = {id: 'airOffers1', genericItems: []};
  const secondAirOffers: any = {id: 'airOffers2', genericItems: []};
  const airOffersReply: any = [firstAirOffers];

  it('should have the correct initial state', () => {
    expect(airOffersInitialState.ids.length).toBe(0);
  });


  it('should by default return the initial state', () => {
    const state = airOffersReducer(airOffersInitialState, {type: 'fake'} as any);
    expect(state).toEqual(airOffersInitialState);
  });

  describe('Actions on state details ', () => {
    beforeEach(() => {
      entitiesState = airOffersReducer(airOffersInitialState, actions.setAirOffersEntities({entities: [firstAirOffers, secondAirOffers]}));
    });

    it('SET action should clear current state details and return a state with the new one', () => {
      const firstState = airOffersReducer(entitiesState, actions.setAirOffers({stateDetails: {requestIds: []}}));
      const secondState = airOffersReducer(firstState, actions.setAirOffers({stateDetails: {requestIds: [], isPending: false}}));
      expect(secondState.isPending).toEqual(false);
    });

    it('UPDATE should update the state details without modifying entities', () => {
      const firstState = airOffersReducer(entitiesState, actions.setAirOffers({stateDetails: {requestIds: []}}));
      const secondState = airOffersReducer(firstState, actions.updateAirOffers({stateDetails: {isPending: false}}));
      expect(secondState.isPending).toEqual(false);
    });

    it('RESET action should return initial state', () => {
      const state = airOffersReducer(entitiesState, actions.resetAirOffers());
      expect(state).toEqual(airOffersInitialState);
    });

    it('FAIL action should update the isPending to false and the isFailure to true', () => {
      const state = airOffersReducer({...airOffersInitialState, isPending: true}, actions.failAirOffersEntities({}));
      expect(state.ids.length).toBe(0);
      expect(state.isPending).toBe(false);
      expect(state.isFailure).toBe(true);
    });
  });

  describe('Entity actions', () => {
    it('SET_ENTITIES action should clear current entities and set new ones', () => {
      const firstState = airOffersReducer(airOffersInitialState, actions.setAirOffersEntities({entities: [firstAirOffers]}));
      const secondState = airOffersReducer(firstState, actions.setAirOffersEntities({entities: [secondAirOffers]}));
      expect(secondState.ids.length).toEqual(1);
      expect((secondState.ids as string[]).find((id) => (id === firstAirOffers.id))).toBeUndefined();
      expect((secondState.ids as string[]).find((id) => (id === secondAirOffers.id))).toBeDefined();
    });

    it('UPDATE_ENTITTIES action should only update existing entities', () => {
      const firstAirOffersUpdated = {...firstAirOffers, genericField: 'genericId'};
      const firstState = airOffersReducer(airOffersInitialState, actions.setAirOffersEntities({entities: [firstAirOffers]}));
      const secondState = airOffersReducer(firstState,
        actions.updateAirOffersEntities({entities: [firstAirOffersUpdated, secondAirOffers]}));
      expect(secondState.ids.length).toEqual(1);
      expect((secondState.ids as string[]).find((id) => (id === firstAirOffers.id))).toBeDefined();
      expect((secondState.ids as string[]).find((id) => (id === secondAirOffers.id))).toBeUndefined();
    });

    it('UPSERT_ENTITIES action should update existing entities and add the new ones', () => {
      const firstAirOffersUpdated = {...firstAirOffers, genericField: 'genericId'};
      const firstState = airOffersReducer(airOffersInitialState, actions.setAirOffersEntities({entities: [firstAirOffers]}));
      const secondState = airOffersReducer(firstState,
        actions.upsertAirOffersEntities({entities: [firstAirOffersUpdated, secondAirOffers]}));
      expect(secondState.ids.length).toEqual(2);
      expect((secondState.ids as string[]).find((id) => (id === firstAirOffers.id))).toBeDefined();
      expect((secondState.ids as string[]).find((id) => (id === secondAirOffers.id))).toBeDefined();
    });

    it('CLEAR_ENTITIES action should clear only the entities', () => {
      const firstState = airOffersReducer(airOffersInitialState, actions.setAirOffersEntities({entities: [firstAirOffers, secondAirOffers]}));
      const secondState = airOffersReducer(firstState, actions.setAirOffers({stateDetails: {requestIds: [], isPending: false}}));
      const thirdState = airOffersReducer(secondState, actions.clearAirOffersEntities());
      expect(thirdState.ids.length).toEqual(0);
    });

    it('FAIL_ENTITIES action should update the isPending to false and the isFailure to true', () => {
      const state = airOffersReducer({...airOffersInitialState, isPending: true}, actions.failAirOffersEntities({}));
      expect(state.ids.length).toBe(0);
      expect(state.isPending).toBe(false);
      expect(state.isFailure).toBe(true);
    });

    it('FAIL_ENTITIES action should update the global isPending to false in case there are some newIds in the payload', () => {
      const firstState = airOffersReducer(airOffersInitialState, actions.setAirOffersEntities({entities: [firstAirOffers]}));
      const secondState = airOffersReducer({...firstState, isPending : true},
        actions.failAirOffersEntities({error: 'dummy error', ids: [secondAirOffers.id]}));
      expect(secondState.isPending).toBe(false);
      expect(secondState.isFailure).toBe(true);
    });
  });

  describe('API call actions', () => {
    it('SET_ENTITIES_FROM_API action should clear current entities and set new ones', () => {
      const firstState = airOffersReducer(airOffersInitialState, actions.setAirOffersEntitiesFromApi({call: Promise.resolve(airOffersReply), requestId: 'test'}));
      expect(firstState.isPending).toEqual(true);
    });
    it('UPDATE_ENTITIES_FROM_API action should clear current entities and set new ones', () => {
      const firstState = airOffersReducer(airOffersInitialState, actions.setAirOffersEntities({entities: [firstAirOffers]}));
      const secondState = airOffersReducer(firstState,
        actions.updateAirOffersEntitiesFromApi({call: Promise.resolve(airOffersReply), ids: [firstAirOffers.id], requestId: 'test'}));
      expect(secondState.isPending).toBeFalsy();
      expect(secondState.entities[firstAirOffers.id]!.isPending).toEqual(true);
    });
    it('UPSERT_ENTITIES_FROM_API action should clear current entities and set new ones', () => {
      const firstState = airOffersReducer(airOffersInitialState, actions.upsertAirOffersEntitiesFromApi({call: Promise.resolve(airOffersReply), requestId: 'test'}));
      expect(firstState.isPending).toEqual(true);
    });
  });
});

`;
