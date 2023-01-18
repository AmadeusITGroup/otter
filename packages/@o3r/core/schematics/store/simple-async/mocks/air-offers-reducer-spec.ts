export const asyncSimpleReducerSpecContent = `import * as actions from './air-offers.actions';
import {airOffersInitialState, airOffersReducer} from './air-offers.reducer';
import {AirOffersState} from './air-offers.state';

describe('AirOffers Store reducer', () => {

  const simpleState: AirOffersState = {model : null, requestIds: []};
  const firstAirOffers: any = {id: 'airOffers1', genericItems: []};
  const airOffersReply: any = {data: {model: firstAirOffers}};
  const secondAirOffers: any = {id: 'airOffers2', genericItems: []};

  it('should by default return the initial state', () => {
    const state = airOffersReducer(airOffersInitialState, {type: 'fake'} as any);
    expect(state).toEqual(airOffersInitialState);
  });

  describe('Actions on state details ', () => {

    it('SET action should clear current cart state details and return a state with the new one', () => {
      const firstState = airOffersReducer(simpleState, actions.setAirOffers({model : firstAirOffers}));
      expect(firstState.model!.id).toEqual('airOffers1');
    });

    it('UPDATE should update the state details without modifying entities', () => {
      const firstState = airOffersReducer({model : firstAirOffers, requestIds: []}, actions.updateAirOffers({model : secondAirOffers}));
      expect(firstState.model!.id).toEqual('airOffers2');
    });

    it('RESET action should return initial state', () => {
      const state = airOffersReducer(simpleState, actions.resetAirOffers());
      expect(state).toEqual(airOffersInitialState);
    });

    it('FAIL action should update the isPending to false and the isFailure to true', () => {
      const state = airOffersReducer({...airOffersInitialState, isPending: true}, actions.failAirOffers({error: {}}));
      expect(state.isPending).toBe(false);
      expect(state.isFailure).toBe(true);
    });
  });

  describe('API call actions', () => {
    it('SET_FROM_API action should clear current entities and set new ones', () => {
      const firstState = airOffersReducer(airOffersInitialState, actions.setAirOffersFromApi({call: Promise.resolve(airOffersReply), requestId: 'test'}));
      expect(firstState.isPending).toEqual(true);
    });
    it('UPDATE_FROM_API action should clear current entities and set new ones', () => {
      const firstState = airOffersReducer(airOffersInitialState, actions.setAirOffers({model: firstAirOffers}));
      const secondState = airOffersReducer(firstState, actions.updateAirOffersFromApi({call: Promise.resolve(airOffersReply), requestId: 'test'}));
      expect(secondState.isPending).toEqual(true);
    });
  });
});

`;
