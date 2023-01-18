export const syncSimpleActionsContent = `import {createAction, props} from '@ngrx/store';
import {AirOffersState} from './air-offers.state';

/** StateDetailsActions */
const ACTION_SET = '[AirOffers] set';
const ACTION_UPDATE = '[AirOffers] update';
const ACTION_RESET = '[AirOffers] reset';

/**
 * Clear the current store object and replace it with the new one
 */
export const setAirOffers = createAction(ACTION_SET, props<{model: AirOffersState}>());

/**
 * Change a part or the whole object in the store.
 */
export const updateAirOffers = createAction(ACTION_UPDATE, props<Partial<{model: AirOffersState}>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetAirOffers = createAction(ACTION_RESET);

`;
