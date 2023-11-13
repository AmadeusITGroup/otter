import {Pet} from '@ama-sdk/showcase-sdk';
import {EntityState} from '@ngrx/entity';
import {AsyncStoreItem} from '@o3r/core';

/**
 * Pet model
 */
export interface PetModel extends AsyncStoreItem, Pet {
}

/**
 * Pet state details
 */
export interface PetStateDetails extends AsyncStoreItem {
}

/**
 * Pet store state
 */
export interface PetState extends EntityState<PetModel>, PetStateDetails {}

/**
 * Name of the Pet Store
 */
export const PET_STORE_NAME = 'pet';

/**
 * Pet Store Interface
 */
export interface PetStore {
  /** Pet state */
  [PET_STORE_NAME]: PetState;
}
