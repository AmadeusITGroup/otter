export const syncEntitySelectorsContent = `import {createFeatureSelector, createSelector} from '@ngrx/store';
import {airOffersAdapter} from './air-offers.reducer';
import {AIR_OFFERS_STORE_NAME, AirOffersState} from './air-offers.state';

const {selectIds, selectEntities, selectAll, selectTotal} = airOffersAdapter.getSelectors();

/** Select AirOffers State */
export const selectAirOffersState = createFeatureSelector<AirOffersState>(AIR_OFFERS_STORE_NAME);

/** Select the array of AirOffers ids */
export const selectAirOffersIds = createSelector(selectAirOffersState, selectIds);

/** Select the array of AirOffers */
export const selectAllAirOffers = createSelector(selectAirOffersState, selectAll);

/** Select the dictionary of AirOffers entities */
export const selectAirOffersEntities = createSelector(selectAirOffersState, selectEntities);

/** Select the total AirOffers count */
export const selectAirOffersTotal = createSelector(selectAirOffersState, selectTotal);
`;
