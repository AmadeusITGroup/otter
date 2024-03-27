/**
 * Reviver: Customer
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 */
import { Customer } from './customer';
import { Address } from '../address';
import { reviveAddress } from '../address';
import { reviveArray, ReviverOptions } from '@ama-sdk/core';

export function reviveCustomer<T extends Customer = Customer>(data: undefined, dictionaries?: any, options?: ReviverOptions): undefined;
export function reviveCustomer(data: Customer, dictionaries?: any, options?: ReviverOptions): Customer ;
export function reviveCustomer(data: any, dictionaries?: any, options?: ReviverOptions): Customer | undefined;
export function reviveCustomer<T extends Customer>(data: T, dictionaries?: any, options?: ReviverOptions): T ;
export function reviveCustomer<T extends Customer>(data: any, dictionaries?: any, options?: ReviverOptions): T | undefined;
/**
 *
 */
export function reviveCustomer<T extends Customer = Customer>(data: any, dictionaries?: any, options?: ReviverOptions): T | undefined {
  if (!data) { return ; }
  data.address = reviveArray<Address>(data.address, dictionaries, reviveAddress) as Address[];
  return data as T;
}
