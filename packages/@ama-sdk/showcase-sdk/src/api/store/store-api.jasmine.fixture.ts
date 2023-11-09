import { StoreApi } from './store-api';

export class StoreApiFixture implements Partial<Readonly<StoreApi>> {

  /** @inheritDoc */
  public readonly apiName = 'StoreApi';

  /**
   * Fixture associated to function deleteOrder
   */
  public deleteOrder: jasmine.Spy = jasmine.createSpy('deleteOrder');
  /**
   * Fixture associated to function getInventory
   */
  public getInventory: jasmine.Spy = jasmine.createSpy('getInventory');
  /**
   * Fixture associated to function getOrderById
   */
  public getOrderById: jasmine.Spy = jasmine.createSpy('getOrderById');
  /**
   * Fixture associated to function placeOrder
   */
  public placeOrder: jasmine.Spy = jasmine.createSpy('placeOrder');
}
