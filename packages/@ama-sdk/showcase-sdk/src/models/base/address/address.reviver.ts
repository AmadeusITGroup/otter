/**
 * Reviver: Address
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 */
import { Address } from './address';
import { ReviverOptions } from '@ama-sdk/core';

export function reviveAddress<T extends Address = Address>(data: undefined, dictionaries?: any, options?: ReviverOptions): undefined;
export function reviveAddress(data: Address, dictionaries?: any, options?: ReviverOptions): Address ;
export function reviveAddress(data: any, dictionaries?: any, options?: ReviverOptions): Address | undefined;
export function reviveAddress<T extends Address>(data: T, dictionaries?: any, options?: ReviverOptions): T ;
export function reviveAddress<T extends Address>(data: any, dictionaries?: any, options?: ReviverOptions): T | undefined;
/**
 *
 */
export function reviveAddress<T extends Address = Address>(data: any, dictionaries?: any, options?: ReviverOptions): T | undefined {
  if (!data) { return ; }
  return data as T;
}
