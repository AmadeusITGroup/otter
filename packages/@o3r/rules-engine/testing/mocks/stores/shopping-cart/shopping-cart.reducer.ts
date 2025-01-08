import {
  createEntityAdapter,
} from '@ngrx/entity';
import {
  ActionCreator,
  createReducer,
  on,
  ReducerTypes,
} from '@ngrx/store';
import {
  AsyncRequest,
  asyncStoreItemAdapter,
  createEntityAsyncRequestAdapter,
  EntityStatus,
} from '@o3r/core';
import * as actions from './shopping-cart.actions';
import {
  CartIdPayload,
} from './shopping-cart.actions';
import {
  ShoppingCart,
} from './shopping-cart.model';
import {
  ShoppingCartModel,
  ShoppingCartState,
  ShoppingCartStateDetails,
} from './shopping-cart.state';

/**
 * ShoppingCart Store adapter
 */
export const shoppingCartAdapter = createEntityAsyncRequestAdapter(createEntityAdapter<ShoppingCartModel>({
  selectId: (model) => model.id
}));

/**
 * ShoppingCart Store initial value
 */
export const shoppingCartInitialState: ShoppingCartState = shoppingCartAdapter.getInitialState<ShoppingCartStateDetails>({
  requestIds: [],
  selectedCartId: null
});

/**
 * Resolves an ongoing request on the AsyncStoreItem status associated to a sub-resource of the entity, and updates the entity's
 * sub-resource with the value from the payload
 * @param state
 * @param payload
 * @param subResource
 */
function resolveRequestAndUpdateSubResource<T extends ShoppingCart, C extends keyof EntityStatus<ShoppingCart>>(
  state: ShoppingCartState,
  payload: Pick<T, C> & Partial<CartIdPayload> & Partial<AsyncRequest>,
  subResource: C) {
  const id = payload.id || state.selectedCartId;
  if (!id || !state.entities[id]) {
    return state;
  }
  const entity = state.entities[id];
  const status = asyncStoreItemAdapter.entityStatusResolveRequest(entity.status, subResource, payload.requestId);
  const changes = { status, [subResource]: payload[subResource] };
  return shoppingCartAdapter.updateOne({ id, changes }, state);
}

/**
 * Turns a Cart received from the API into a CartModel with all the status properties
 * @param cart
 */
export function initializeCartModel(cart: ShoppingCart): ShoppingCartModel {
  const newCart: ShoppingCartModel = {
    ...asyncStoreItemAdapter.initialize(cart),
    status: {}
  };
  (Object.keys(cart) as (keyof typeof cart)[])
    .filter((key) => key !== 'id' && typeof cart[key] !== 'undefined')
    .forEach((key) => {
      (newCart.status as any)[key] = asyncStoreItemAdapter.initialize({});
    });
  return newCart;
}

/**
 * List of basic actions for ShoppingCart Store
 */
export const shoppingCartReducerFeatures: ReducerTypes<ShoppingCartState, ActionCreator[]>[] = [
  on(actions.resetShoppingCart, () => shoppingCartInitialState),

  on(actions.setShoppingCart, (state, payload) => ({ ids: state.ids, entities: state.entities, ...payload.stateDetails })),

  on(actions.selectShoppingCart, (state, payload) => ({ ...state, selectedCartId: payload.id })),

  on(actions.cancelShoppingCartRequest, (state, action) => asyncStoreItemAdapter.resolveRequest(state, action.requestId)),

  on(actions.updateShoppingCart, (state, payload) => ({ ...state, ...payload.stateDetails })),

  on(actions.setShoppingCartEntities, (state, payload) =>
    shoppingCartAdapter.addMany(
      payload.entities.map((entity) => initializeCartModel(entity)),
      shoppingCartAdapter.removeAll(asyncStoreItemAdapter.resolveRequest(state, payload.requestId)))
  ),

  on(actions.updateShoppingCartEntities, (state, payload) =>
    shoppingCartAdapter.resolveRequestMany(state, payload.entities, payload.requestId)
  ),

  on(actions.upsertShoppingCartEntities, (state, payload) =>
    shoppingCartAdapter.upsertMany(
      payload.entities.map((entity) => initializeCartModel(entity)),
      asyncStoreItemAdapter.resolveRequest(state, payload.requestId)
    )
  ),

  on(actions.clearShoppingCartEntities, (state) => shoppingCartAdapter.removeAll(state)),

  on(actions.failShoppingCartEntities, (state, payload) =>
    shoppingCartAdapter.failRequestMany(state, payload && payload.ids, payload.requestId)
  ),

  on(actions.setShoppingCartEntitiesFromApi, actions.upsertShoppingCartEntitiesFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)),

  on(actions.updateShoppingCartEntitiesFromApi, (state, payload) =>
    shoppingCartAdapter.addRequestMany(state, payload.ids, payload.requestId)),

  on(actions.setShoppingCartEntity, (state, payload) => shoppingCartAdapter.addOne(
    initializeCartModel(payload.entity),
    asyncStoreItemAdapter.resolveRequest(shoppingCartAdapter.removeAll(state), payload.requestId)
  )),

  on(actions.setXmasHampersInCart, (state, payload) => resolveRequestAndUpdateSubResource(state, payload, 'xmasHampers'))

];

/**
 * ShoppingCart Store reducer
 */
export const shoppingCartReducer = createReducer(
  shoppingCartInitialState,
  ...shoppingCartReducerFeatures
);
