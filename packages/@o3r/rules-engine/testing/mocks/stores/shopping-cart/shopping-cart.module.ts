import {
  InjectionToken,
  ModuleWithProviders,
  NgModule
} from '@angular/core';
import {
  EffectsModule
} from '@ngrx/effects';
import {
  Action,
  ActionReducer,
  StoreModule
} from '@ngrx/store';
import {
  ShoppingCartEffect
} from './shopping-cart.effect';
import {
  shoppingCartReducer
} from './shopping-cart.reducer';
import {
  SHOPPING_CART_STORE_NAME,
  ShoppingCartState
} from './shopping-cart.state';

/** Token of the ShoppingCart reducer */
export const SHOPPING_CART_REDUCER_TOKEN = new InjectionToken<ActionReducer<ShoppingCartState, Action>>('Feature ShoppingCart Reducer');

/** Provide default reducer for ShoppingCart store */
export function getDefaultShoppingCartReducer() {
  return shoppingCartReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(SHOPPING_CART_STORE_NAME, SHOPPING_CART_REDUCER_TOKEN), EffectsModule.forFeature([ShoppingCartEffect])
  ],
  providers: [
    { provide: SHOPPING_CART_REDUCER_TOKEN, useFactory: getDefaultShoppingCartReducer }
  ]
})
export class ShoppingCartStoreModule {
  public static forRoot<T extends ShoppingCartState>(reducerFactory: () => ActionReducer<T, Action>): ModuleWithProviders<ShoppingCartStoreModule> {
    return {
      ngModule: ShoppingCartStoreModule,
      providers: [
        { provide: SHOPPING_CART_REDUCER_TOKEN, useFactory: reducerFactory }
      ]
    };
  }
}
