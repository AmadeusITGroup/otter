import {Pet} from '@ama-sdk/showcase-sdk';
import {EntityState} from '@ngrx/entity';
import {AsyncStoreItem} from '@o3r/core';

/**
 * Pet model
 */
export interface PetModel extends AsyncStoreItem, Pet {

}

/**
 * Petstore state details
 */
export interface PetstoreStateDetails extends AsyncStoreItem {}

/**
 * Petstore store state
 */
export interface PetstoreState extends EntityState<PetModel>, PetstoreStateDetails {}

/**
 * Name of the Petstore Store
 */
export const PETSTORE_STORE_NAME = 'petstore';

/**
 * Petstore Store Interface
 */
export interface PetstoreStore {
  /** Petstore state */
  [PETSTORE_STORE_NAME]: PetstoreState;
}
