/**
 * Reviver: Address
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 */
import { Address } from './address';

export function reviveAddress<T extends Address = Address>(data: undefined, dictionaries?: any): undefined;
export function reviveAddress(data: Address, dictionaries?: any): Address ;
export function reviveAddress(data: any, dictionaries?: any): Address | undefined;
export function reviveAddress<T extends Address>(data: T, dictionaries?: any): T ;
export function reviveAddress<T extends Address>(data: any, dictionaries?: any): T | undefined;
/**
 *
 */
export function reviveAddress<T extends Address = Address>(data: any, dictionaries?: any): T | undefined {
  if (!data) { return ; }
  return data as T;
}
