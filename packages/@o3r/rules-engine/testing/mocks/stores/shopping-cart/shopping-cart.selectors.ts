import {createFeatureSelector, createSelector} from '@ngrx/store';
import {shoppingCartAdapter} from './shopping-cart.reducer';
import {SHOPPING_CART_STORE_NAME, ShoppingCartState, ShoppingCartModel} from './shopping-cart.state';

const {selectIds, selectEntities, selectAll, selectTotal} = shoppingCartAdapter.getSelectors();

/** Select ShoppingCart State */
export const selectShoppingCartState = createFeatureSelector<ShoppingCartState>(SHOPPING_CART_STORE_NAME);

/** Select the array of ShoppingCart ids */
export const selectShoppingCartIds = createSelector(selectShoppingCartState, selectIds);

/** Select the array of ShoppingCart */
export const selectAllShoppingCart = createSelector(selectShoppingCartState, selectAll);

/** Select the dictionary of ShoppingCart entities */
export const selectShoppingCartEntities = createSelector(selectShoppingCartState, selectEntities);

/** Select the total ShoppingCart count */
export const selectShoppingCartTotal = createSelector(selectShoppingCartState, selectTotal);

/** Select the store pending status */
export const selectShoppingCartStorePendingStatus = createSelector(selectShoppingCartState, (state) => state.isPending || false);

/** Select the selectedCartId */
export const selectCurrentShoppingCartId = createSelector(selectShoppingCartState, (state) => state.selectedCartId);

/** Select the dictionary cart entities */
export const selectCartEntities = createSelector(selectShoppingCartState, selectEntities);

/** Select the Cart associated to the selectedCartId */
export const selectCurrentShoppingCart =
  createSelector(selectCartEntities, selectCurrentShoppingCartId, (carts, id): ShoppingCartModel | null => id && carts[id] ? carts[id]! : null);
