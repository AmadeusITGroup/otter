import {EntityState} from '@ngrx/entity';
import {AsyncStoreItem} from '@o3r/core';
import type { Contact } from '../../contact';

/**
 * Contact model
 */
export interface ContactModel extends AsyncStoreItem, Contact {}

/**
 * Contact state details
 */
export interface ContactStateDetails extends AsyncStoreItem {}

/**
 * Contact store state
 */
export interface ContactState extends EntityState<ContactModel>, ContactStateDetails {}

/**
 * Name of the Contact Store
 */
export const CONTACT_STORE_NAME = 'contact';

/**
 * Contact Store Interface
 */
export interface ContactStore {
  /** Contact state */
  [CONTACT_STORE_NAME]: ContactState;
}
