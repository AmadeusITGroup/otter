import {shoppingCartInitialState} from './shopping-cart.reducer';
import * as selectors from './shopping-cart.selectors';

describe('ShoppingCart Selectors tests', () => {
  it('should provide the pending status of the store', () => {
    expect(selectors.selectShoppingCartStorePendingStatus.projector(shoppingCartInitialState)).toBeFalsy();
    expect(selectors.selectShoppingCartStorePendingStatus.projector({...shoppingCartInitialState, isPending: false})).toBe(false);
    expect(selectors.selectShoppingCartStorePendingStatus.projector({...shoppingCartInitialState, isPending: true})).toBe(true);
  });
});
