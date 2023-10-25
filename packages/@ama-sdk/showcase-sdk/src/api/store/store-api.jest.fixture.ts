import { Order } from '../../models/base/order/index';

import { DeleteOrderRequestData, GetInventoryRequestData, GetOrderByIdRequestData, PlaceOrderRequestData, StoreApi } from './store-api';

export class StoreApiFixture implements Partial<Readonly<StoreApi>> {

  /** @inheritDoc */
  public readonly apiName = 'StoreApi';

  /**
   * Fixture associated to function deleteOrder
   */
  public deleteOrder: jest.Mock<Promise<never>, [DeleteOrderRequestData]> = jest.fn();
  /**
   * Fixture associated to function getInventory
   */
  public getInventory: jest.Mock<Promise<{ [key: string]: number }>, [GetInventoryRequestData]> = jest.fn();
  /**
   * Fixture associated to function getOrderById
   */
  public getOrderById: jest.Mock<Promise<Order>, [GetOrderByIdRequestData]> = jest.fn();
  /**
   * Fixture associated to function placeOrder
   */
  public placeOrder: jest.Mock<Promise<Order>, [PlaceOrderRequestData]> = jest.fn();
}

