export const syncEntityActionsContent = `import {AirOffer} from '@dapi/sdk';
import {createAction, props} from '@ngrx/store';
import {SetActionPayload, SetEntitiesActionPayload, UpdateActionPayload, UpdateEntitiesActionPayloadWithId} from '@o3r/core';
import {AirOffersStateDetails} from './air-offers.state';

/** StateDetailsActions */
const ACTION_SET = '[AirOffers] set';
const ACTION_UPDATE = '[AirOffers] update';
const ACTION_RESET = '[AirOffers] reset';

/** Entity Actions */
const ACTION_CLEAR_ENTITIES = '[AirOffers] clear entities';
const ACTION_UPDATE_ENTITIES = '[AirOffers] update entities';
const ACTION_UPSERT_ENTITIES = '[AirOffers] upsert entities';
const ACTION_SET_ENTITIES = '[AirOffers] set entities';

/**
 * Clear the StateDetails of the store and replace it.
 */
export const setAirOffers = createAction(ACTION_SET, props<SetActionPayload<AirOffersStateDetails>>());

/**
 * Change a part or the whole object in the store.
 */
export const updateAirOffers = createAction(ACTION_UPDATE, props<UpdateActionPayload<AirOffersStateDetails>>());

/**
 * Action to reset the whole state, by returning it to initial state.
 */
export const resetAirOffers = createAction(ACTION_RESET);

/**
 * Clear all airOffers and fill the store with the payload
 */
export const setAirOffersEntities  = createAction(ACTION_SET_ENTITIES, props<SetEntitiesActionPayload<AirOffer>>());

/**
 * Update airOffers with known IDs, ignore the new ones
 */
export const updateAirOffersEntities = createAction(ACTION_UPDATE_ENTITIES, props<UpdateEntitiesActionPayloadWithId<AirOffer>>());

/**
 * Update airOffers with known IDs, insert the new ones
 */
export const upsertAirOffersEntities = createAction(ACTION_UPSERT_ENTITIES, props<SetEntitiesActionPayload<AirOffer>>());

/**
 * Clear only the entities, keeps the other attributes in the state
 */
export const clearAirOffersEntities = createAction(ACTION_CLEAR_ENTITIES);

`;
