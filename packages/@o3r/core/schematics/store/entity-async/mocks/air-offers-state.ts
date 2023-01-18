export const asyncEntityStateContent = `import {AirOffer} from '@dapi/sdk';
import {EntityState} from '@ngrx/entity';
import {AsyncStoreItem} from '@o3r/core';

/**
 * AirOffer model
 */
export interface AirOfferModel extends AsyncStoreItem, AirOffer {

}

/**
 * AirOffers state details
 */
export interface AirOffersStateDetails extends AsyncStoreItem {}

/**
 * AirOffers store state
 */
export interface AirOffersState extends EntityState<AirOfferModel>, AirOffersStateDetails {}

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
