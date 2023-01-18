export const asyncEntityActionsContent = `import {
  asyncProps,
  AsyncRequest,
  FromApiActionPayload,
  SetAsyncStoreItemEntitiesActionPayload,
  UpdateAsyncStoreItemEntitiesActionPayloadWithId,
  FailAsyncStoreItemEntitiesActionPayload,
  SetActionPayload,
  UpdateActionPayload
} from '@o3r/core';
import {AirOffer} from '@dapi/sdk';
import { createAction, props } from '@ngrx/store';
import {AirOffersStateDetails} from './air-offers.state';

/** StateDetailsActions */
const ACTION_SET = '[AirOffers] set';
const ACTION_UPDATE = '[AirOffers] update';
const ACTION_RESET = '[AirOffers] reset';
const ACTION_CANCEL_REQUEST = '[AirOffers] cancel request';

/** Entity Actions */
const ACTION_CLEAR_ENTITIES = '[AirOffers] clear entities';
const ACTION_UPDATE_ENTITIES = '[AirOffers] update entities';
const ACTION_UPSERT_ENTITIES = '[AirOffers] upsert entities';
const ACTION_SET_ENTITIES = '[AirOffers] set entities';
const ACTION_FAIL_ENTITIES = '[AirOffers] fail entities';

/** Async Actions */
const ACTION_SET_ENTITIES_FROM_API = '[AirOffers] set entities from api';
const ACTION_UPDATE_ENTITIES_FROM_API = '[AirOffers] update entities from api';
const ACTION_UPSERT_ENTITIES_FROM_API = '[AirOffers] upsert entities from api';

/** Action to clear the StateDetails of the store and replace it */
export const setAirOffers = createAction(ACTION_SET, props<SetActionPayload<AirOffersStateDetails>>());

/** Action to change a part or the whole object in the store. */
export const updateAirOffers = createAction(ACTION_UPDATE, props<UpdateActionPayload<AirOffersStateDetails>>());

/** Action to reset the whole state, by returning it to initial state. */
export const resetAirOffers = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelAirOffersRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/** Action to clear all airOffers and fill the store with the payload */
export const setAirOffersEntities  = createAction(ACTION_SET_ENTITIES, props<SetAsyncStoreItemEntitiesActionPayload<AirOffer>>());

/** Action to update airOffers with known IDs, ignore the new ones */
export const updateAirOffersEntities = createAction(ACTION_UPDATE_ENTITIES, props<UpdateAsyncStoreItemEntitiesActionPayloadWithId<AirOffer>>());

/** Action to update airOffers with known IDs, insert the new ones */
export const upsertAirOffersEntities = createAction(ACTION_UPSERT_ENTITIES, props<SetAsyncStoreItemEntitiesActionPayload<AirOffer>>());

/** Action to empty the list of entities, keeping the global state */
export const clearAirOffersEntities = createAction(ACTION_CLEAR_ENTITIES);

/** Action to update failureStatus for every AirOffer */
export const failAirOffersEntities = createAction(ACTION_FAIL_ENTITIES, props<FailAsyncStoreItemEntitiesActionPayload<any>>());

/**
 * Action to put the global status of the store in a pending state. Call SET action with the list of AirOffers received, when this action resolves.
 * If the call fails, dispatch FAIL_ENTITIES action
 */
export const setAirOffersEntitiesFromApi = createAction(ACTION_SET_ENTITIES_FROM_API, asyncProps<FromApiActionPayload<AirOffer[]>>());

/**
 * Action to change isPending status of elements to be updated with a request. Call UPDATE action with the list of AirOffers received, when this action resolves.
 * If the call fails, dispatch FAIL_ENTITIES action
 */
export const updateAirOffersEntitiesFromApi = createAction(ACTION_UPDATE_ENTITIES_FROM_API, asyncProps<FromApiActionPayload<AirOffer[]> & { ids: string[] }>());

/**
 * Action to put global status of the store in a pending state. Call UPSERT action with the list of AirOffers received, when this action resolves.
 * If the call fails, dispatch FAIL_ENTITIES action
 */
export const upsertAirOffersEntitiesFromApi = createAction(ACTION_UPSERT_ENTITIES_FROM_API, asyncProps<FromApiActionPayload<AirOffer[]>>());

`;
