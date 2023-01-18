export const syncEntityStateContent = `import {AirOffer} from '@dapi/sdk';
import {EntityState} from '@ngrx/entity';

/**
 * AirOffers model
 */
export interface AirOfferModel  extends AirOffer  {

}

/**
 * AirOffers state details
 */
export interface AirOffersStateDetails {}

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
