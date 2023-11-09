/**
 * Reviver: Order
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 */
import { Order } from './order';
import { utils } from '@ama-sdk/core';

export function reviveOrder<T extends Order = Order>(data: undefined, dictionaries?: any): undefined;
export function reviveOrder(data: Order, dictionaries?: any): Order;
export function reviveOrder(data: any, dictionaries?: any): Order | undefined;
export function reviveOrder<T extends Order>(data: T, dictionaries?: any): T;
export function reviveOrder<T extends Order>(data: any, dictionaries?: any): T | undefined;
/**
 *
 * @param data
 * @param dictionaries
 */
export function reviveOrder<T extends Order = Order>(data: any): T | undefined {
  if (!data) { return; }
  data.shipDate = data.shipDate ? new utils.DateTime(data.shipDate) : undefined;
  return data as T;
}

