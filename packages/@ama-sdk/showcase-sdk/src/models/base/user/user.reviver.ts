/**
 * Reviver: User
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 */
import { User } from './user';

export function reviveUser<T extends User = User>(data: undefined, dictionaries?: any): undefined;
export function reviveUser(data: User, dictionaries?: any): User ;
export function reviveUser(data: any, dictionaries?: any): User | undefined;
export function reviveUser<T extends User>(data: T, dictionaries?: any): T ;
export function reviveUser<T extends User>(data: any, dictionaries?: any): T | undefined;
/**
 *
 */
export function reviveUser<T extends User = User>(data: any, dictionaries?: any): T | undefined {
  if (!data) { return ; }
  return data as T;
}
