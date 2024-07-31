import { Order } from '../../models/base/order/index';

import { StoreApi, StoreApiDeleteOrderRequestData, StoreApiGetInventoryRequestData, StoreApiGetOrderByIdRequestData, StoreApiPlaceOrderRequestData } from './store-api';

export class StoreApiFixture implements Partial<Readonly<StoreApi>> {

  /** @inheritDoc */
  public readonly apiName = 'StoreApi';

    /**
   * Fixture associated to function deleteOrder
   */
  public deleteOrder: jest.Mock<Promise<never>, [StoreApiDeleteOrderRequestData]> = jest.fn();
  /**
   * Fixture associated to function getInventory
   */
  public getInventory: jest.Mock<Promise<{ [key: string]: number; }>, [StoreApiGetInventoryRequestData]> = jest.fn();
  /**
   * Fixture associated to function getOrderById
   */
  public getOrderById: jest.Mock<Promise<Order>, [StoreApiGetOrderByIdRequestData]> = jest.fn();
  /**
   * Fixture associated to function placeOrder
   */
  public placeOrder: jest.Mock<Promise<Order>, [StoreApiPlaceOrderRequestData]> = jest.fn();
}

