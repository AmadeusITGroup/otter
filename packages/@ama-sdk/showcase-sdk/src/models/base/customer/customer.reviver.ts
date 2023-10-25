/**
 * Reviver: Customer
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 */
import { Customer } from './customer';
import { Address } from '../address';
import { reviveAddress } from '../address';
import { reviveArray } from '@ama-sdk/core';

export function reviveCustomer<T extends Customer = Customer>(data: undefined, dictionaries?: any): undefined;
export function reviveCustomer(data: Customer, dictionaries?: any): Customer;
export function reviveCustomer(data: any, dictionaries?: any): Customer | undefined;
export function reviveCustomer<T extends Customer>(data: T, dictionaries?: any): T;
export function reviveCustomer<T extends Customer>(data: any, dictionaries?: any): T | undefined;
/**
 *
 * @param data
 * @param dictionaries
 */
export function reviveCustomer<T extends Customer = Customer>(data: any, dictionaries?: any): T | undefined {
  if (!data) { return; }
  data.address = reviveArray<Address>(data.address, dictionaries, reviveAddress) as Address[];
  return data as T;
}

