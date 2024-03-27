/**
 * Reviver: Order
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 */
import { Order } from './order';
import { ReviverOptions, utils } from '@ama-sdk/core';

export function reviveOrder<T extends Order = Order>(data: undefined, dictionaries?: any, options?: ReviverOptions): undefined;
export function reviveOrder(data: Order, dictionaries?: any, options?: ReviverOptions): Order ;
export function reviveOrder(data: any, dictionaries?: any, options?: ReviverOptions): Order | undefined;
export function reviveOrder<T extends Order>(data: T, dictionaries?: any, options?: ReviverOptions): T ;
export function reviveOrder<T extends Order>(data: any, dictionaries?: any, options?: ReviverOptions): T | undefined;
/**
 *
 */
export function reviveOrder<T extends Order = Order>(data: any, dictionaries?: any, options?: ReviverOptions): T | undefined {
  if (!data) { return ; }
  data.shipDate = data.shipDate ? new utils.DateTime(data.shipDate) : undefined;
  return data as T;
}
