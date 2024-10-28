import {
  createAction,
  props
} from '@ngrx/store';
import {
  asyncProps,
  AsyncRequest,
  FailAsyncStoreItemEntitiesActionPayload,
  FromApiActionPayload,
  SetActionPayload,
  SetAsyncStoreItemEntitiesActionPayload,
  SetAsyncStoreItemEntityActionPayload,
  UpdateActionPayload,
  UpdateAsyncStoreItemEntitiesActionPayloadWithId
} from '@o3r/core';
import {
  XmasHamper
} from '../../xmas-hamper.mock';
import {
  ShoppingCart
} from './shopping-cart.model';
import {
  ShoppingCartStateDetails
} from './shopping-cart.state';

const ACTION_SET_XMAS_HAMPERS_IN_CART = '[ShoppingCart] [XmasHampers] set';

const ACTION_SET_ENTITY = '[ShoppingCart] set entity';

/** StateDetailsActions */
const ACTION_SELECT = '[ShoppingCart] select';
const ACTION_SET = '[ShoppingCart] set';
const ACTION_UPDATE = '[ShoppingCart] update';
const ACTION_RESET = '[ShoppingCart] reset';
const ACTION_CANCEL_REQUEST = '[ShoppingCart] cancel request';

/** Entity Actions */
const ACTION_CLEAR_ENTITIES = '[ShoppingCart] clear entities';
const ACTION_UPDATE_ENTITIES = '[ShoppingCart] update entities';
const ACTION_UPSERT_ENTITIES = '[ShoppingCart] upsert entities';
const ACTION_SET_ENTITIES = '[ShoppingCart] set entities';
const ACTION_FAIL_ENTITIES = '[ShoppingCart] fail entities';

/** Async Actions */
const ACTION_SET_ENTITIES_FROM_API = '[ShoppingCart] set entities from api';
const ACTION_UPDATE_ENTITIES_FROM_API = '[ShoppingCart] update entities from api';
const ACTION_UPSERT_ENTITIES_FROM_API = '[ShoppingCart] upsert entities from api';

/** Action to clear the StateDetails of the store and replace it */
export const setShoppingCart = createAction(ACTION_SET, props<SetActionPayload<ShoppingCartStateDetails>>());

/** Action to change a part or the whole object in the store. */
export const updateShoppingCart = createAction(ACTION_UPDATE, props<UpdateActionPayload<ShoppingCartStateDetails>>());

/** Action to reset the whole state, by returning it to initial state. */
export const resetShoppingCart = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelShoppingCartRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/** Action to clear all shoppingCart and fill the store with the payload */
export const setShoppingCartEntities = createAction(ACTION_SET_ENTITIES, props<SetAsyncStoreItemEntitiesActionPayload<ShoppingCart>>());

/** Action to insert a Cart */
export const setShoppingCartEntity = createAction(ACTION_SET_ENTITY, props<SetAsyncStoreItemEntityActionPayload<ShoppingCart>>());

/** Action to update shoppingCart with known IDs, ignore the new ones */
export const updateShoppingCartEntities = createAction(ACTION_UPDATE_ENTITIES, props<UpdateAsyncStoreItemEntitiesActionPayloadWithId<ShoppingCart>>());

/** Action to update shoppingCart with known IDs, insert the new ones */
export const upsertShoppingCartEntities = createAction(ACTION_UPSERT_ENTITIES, props<SetAsyncStoreItemEntitiesActionPayload<ShoppingCart>>());

/** Action to empty the list of entities, keeping the global state */
export const clearShoppingCartEntities = createAction(ACTION_CLEAR_ENTITIES);

/** Action to update failureStatus for every ShoppingCart */
export const failShoppingCartEntities = createAction(ACTION_FAIL_ENTITIES, props<FailAsyncStoreItemEntitiesActionPayload<any>>());

/**
 * Action to put the global status of the store in a pending state. Call SET action with the list of ShoppingCarts received, when this action resolves.
 * If the call fails, dispatch FAIL_ENTITIES action
 */
export const setShoppingCartEntitiesFromApi = createAction(ACTION_SET_ENTITIES_FROM_API, asyncProps<FromApiActionPayload<ShoppingCart[]>>());

/**
 * Action to change isPending status of elements to be updated with a request. Call UPDATE action with the list of ShoppingCarts received, when this action resolves.
 * If the call fails, dispatch FAIL_ENTITIES action
 */
export const updateShoppingCartEntitiesFromApi = createAction(ACTION_UPDATE_ENTITIES_FROM_API, asyncProps<FromApiActionPayload<ShoppingCart[]> & { ids: string[] }>());

/**
 * Action to put global status of the store in a pending state. Call UPSERT action with the list of ShoppingCarts received, when this action resolves.
 * If the call fails, dispatch FAIL_ENTITIES action
 */
export const upsertShoppingCartEntitiesFromApi = createAction(ACTION_UPSERT_ENTITIES_FROM_API, asyncProps<FromApiActionPayload<ShoppingCart[]>>());

/** Payload containing a Cart ID */
export interface CartIdPayload {
  /** ID of the cart to interact with */
  id: string;
}

/**
 * Action to set an entity as the selected one
 */
export const selectShoppingCart = createAction(ACTION_SELECT, props<CartIdPayload>());

/** Payload for actions that set or upsert a collection of Hampers to an entity */
export interface SetXmasHampersInCartPayload extends Partial<CartIdPayload>, Partial<AsyncRequest> {

  /** Gifts from Santa */
  xmasHampers: XmasHamper[];
}

/**
 * Sets Christmas hampers inside an existing Cart
 */
export const setXmasHampersInCart = createAction(ACTION_SET_XMAS_HAMPERS_IN_CART, props<SetXmasHampersInCartPayload>());
