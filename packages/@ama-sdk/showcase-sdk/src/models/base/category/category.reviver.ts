/**
 * Reviver: Category
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 */
import { Category } from './category';

export function reviveCategory<T extends Category = Category>(data: undefined, dictionaries?: any): undefined;
export function reviveCategory(data: Category, dictionaries?: any): Category ;
export function reviveCategory(data: any, dictionaries?: any): Category | undefined;
export function reviveCategory<T extends Category>(data: T, dictionaries?: any): T ;
export function reviveCategory<T extends Category>(data: any, dictionaries?: any): T | undefined;
/**
 *
 */
export function reviveCategory<T extends Category = Category>(data: any, dictionaries?: any): T | undefined {
  if (!data) { return ; }
  return data as T;
}
