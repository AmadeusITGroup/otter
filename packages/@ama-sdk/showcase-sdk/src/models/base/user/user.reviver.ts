/**
 * Reviver: User
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 */
import { User } from './user';
import { ReviverOptions } from '@ama-sdk/core';

export function reviveUser<T extends User = User>(data: undefined, dictionaries?: any, options?: ReviverOptions): undefined;
export function reviveUser(data: User, dictionaries?: any, options?: ReviverOptions): User ;
export function reviveUser(data: any, dictionaries?: any, options?: ReviverOptions): User | undefined;
export function reviveUser<T extends User>(data: T, dictionaries?: any, options?: ReviverOptions): T ;
export function reviveUser<T extends User>(data: any, dictionaries?: any, options?: ReviverOptions): T | undefined;
/**
 *
 */
export function reviveUser<T extends User = User>(data: any, dictionaries?: any, options?: ReviverOptions): T | undefined {
  if (!data) { return ; }
  return data as T;
}
