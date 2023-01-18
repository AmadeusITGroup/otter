export const syncSimpleReducerSpecContent = `import * as actions from './air-offers.actions';
import {airOffersInitialState, airOffersReducer} from './air-offers.reducer';
import {AirOffersState} from './air-offers.state';

describe('AirOffers Store reducer', () => {

  const simpleState: AirOffersState = {};
  const firstAirOffers: any = {id: 'airOffers1', genericItems: []};
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
      const firstState = airOffersReducer({model : firstAirOffers}, actions.updateAirOffers({model : secondAirOffers}));
      expect(firstState.model!.id).toEqual('airOffers2');
    });

    it('RESET action should return initial state', () => {
      const state = airOffersReducer(simpleState, actions.resetAirOffers());
      expect(state).toEqual(airOffersInitialState);
    });
  });
});
`;
