export const syncSimpleStateContent = `/**
 * AirOffers store state
 */
export interface AirOffersState {}

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
