/**
 * Reviver: Category
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 */
import { Category } from './category';
import { ReviverOptions } from '@ama-sdk/core';

export function reviveCategory<T extends Category = Category>(data: undefined, dictionaries?: any, options?: ReviverOptions): undefined;
export function reviveCategory(data: Category, dictionaries?: any, options?: ReviverOptions): Category ;
export function reviveCategory(data: any, dictionaries?: any, options?: ReviverOptions): Category | undefined;
export function reviveCategory<T extends Category>(data: T, dictionaries?: any, options?: ReviverOptions): T ;
export function reviveCategory<T extends Category>(data: any, dictionaries?: any, options?: ReviverOptions): T | undefined;
/**
 *
 */
export function reviveCategory<T extends Category = Category>(data: any, dictionaries?: any, options?: ReviverOptions): T | undefined {
  if (!data) { return ; }
  return data as T;
}
