/**
 * Reviver: Tag
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 */
import { Tag } from './tag';

export function reviveTag<T extends Tag = Tag>(data: undefined, dictionaries?: any): undefined;
export function reviveTag(data: Tag, dictionaries?: any): Tag ;
export function reviveTag(data: any, dictionaries?: any): Tag | undefined;
export function reviveTag<T extends Tag>(data: T, dictionaries?: any): T ;
export function reviveTag<T extends Tag>(data: any, dictionaries?: any): T | undefined;
/**
 *
 */
export function reviveTag<T extends Tag = Tag>(data: any, dictionaries?: any): T | undefined {
  if (!data) { return ; }
  return data as T;
}
