export const asyncEntitySelectorsSpecContent = `import {airOffersInitialState} from './air-offers.reducer';
import * as selectors from './air-offers.selectors';

describe('AirOffers Selectors tests', () => {
  it('should provide the pending status of the store', () => {
    expect(selectors.selectAirOffersStorePendingStatus.projector(airOffersInitialState)).toBeFalsy();
    expect(selectors.selectAirOffersStorePendingStatus.projector({...airOffersInitialState, isPending: false})).toBe(false);
    expect(selectors.selectAirOffersStorePendingStatus.projector({...airOffersInitialState, isPending: true})).toBe(true);
  });
});

`;
