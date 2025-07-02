import {
  EntityState,
} from '@ngrx/entity';
import {
  AsyncStoreItem,
  EntityStatus,
} from '@o3r/core';
import {
  ShoppingCart,
} from './shopping-cart.model';

/**
 * ShoppingCart model
 */
export interface ShoppingCartModel extends AsyncStoreItem, ShoppingCart {
  /** Status of the sub resources */
  status: EntityStatus<ShoppingCart>;
}

/**
 * ShoppingCart state details
 */
export interface ShoppingCartStateDetails extends AsyncStoreItem {
  /** Selected Cart ID */
  selectedCartId: string | null;
}

/**
 * ShoppingCart store state
 */
export interface ShoppingCartState extends EntityState<ShoppingCartModel>, ShoppingCartStateDetails {}

/**
 * Name of the ShoppingCart Store
 */
export const SHOPPING_CART_STORE_NAME = 'shoppingCart';

/**
 * ShoppingCart Store Interface
 */
export interface ShoppingCartStore {
  /** ShoppingCart state */
  [SHOPPING_CART_STORE_NAME]: ShoppingCartState;
}
