export const asyncSimpleActionsContent = `import {asyncProps, AsyncRequest, FromApiActionPayload, WithRequestId} from '@o3r/core';
import {AirOffer} from '@dapi/sdk';
import {createAction, props} from '@ngrx/store';
import {AirOffersModel} from './air-offers.state';

/** StateDetailsActions */
const ACTION_SET = '[AirOffers] set';
const ACTION_UPDATE = '[AirOffers] update';
const ACTION_RESET = '[AirOffers] reset';
const ACTION_FAIL = '[AirOffers] fail';
const ACTION_CANCEL_REQUEST = '[AirOffers] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[AirOffers] set from api';
const ACTION_UPDATE_FROM_API = '[AirOffers] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setAirOffers = createAction(ACTION_SET, props<WithRequestId<AirOffersModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateAirOffers = createAction(ACTION_UPDATE, props<WithRequestId<Partial<AirOffersModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetAirOffers = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelAirOffersRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
export const failAirOffers = createAction(ACTION_FAIL, props<WithRequestId<{error: any}>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setAirOffersFromApi = createAction(ACTION_SET_FROM_API, asyncProps<FromApiActionPayload<AirOffer>>());

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateAirOffersFromApi = createAction(ACTION_UPDATE_FROM_API, asyncProps<FromApiActionPayload<AirOffer>>());

`;
