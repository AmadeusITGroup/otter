/**
 * Reviver: Tag
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 */
import { Tag } from './tag';
import { ReviverOptions } from '@ama-sdk/core';

export function reviveTag<T extends Tag = Tag>(data: undefined, dictionaries?: any, options?: ReviverOptions): undefined;
export function reviveTag(data: Tag, dictionaries?: any, options?: ReviverOptions): Tag ;
export function reviveTag(data: any, dictionaries?: any, options?: ReviverOptions): Tag | undefined;
export function reviveTag<T extends Tag>(data: T, dictionaries?: any, options?: ReviverOptions): T ;
export function reviveTag<T extends Tag>(data: any, dictionaries?: any, options?: ReviverOptions): T | undefined;
/**
 *
 */
export function reviveTag<T extends Tag = Tag>(data: any, dictionaries?: any, options?: ReviverOptions): T | undefined {
  if (!data) { return ; }
  return data as T;
}
