export const asyncSimpleStateContent = `import {AsyncStoreItem} from '@o3r/core';
import {AirOffer} from '@dapi/sdk';
/**
 * AirOffers model
 */
export interface AirOffersModel {
  model: AirOffer | null;
}

/**
 * AirOffer model details
 */
export interface AirOffersStateDetails extends AsyncStoreItem {
}

/**
 * AirOffers store state
 */
export interface AirOffersState extends AirOffersStateDetails, AirOffersModel {
}

/**
 * Name of the AirOffers Store
 */
export const AIR_OFFERS_STORE_NAME = 'airOffers';

/**
 * AirOffers Store Interface
 */
export interface AirOffersStore {
  /** AirOffers state */
  [AIR_OFFERS_STORE_NAME]: AirOffersState;
}

`;
