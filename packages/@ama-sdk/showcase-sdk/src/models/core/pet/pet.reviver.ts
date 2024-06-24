/**
 * Reviver: Pet
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 */
import { Pet } from './pet';
import { baseRevivePet } from '../../base';
import type { ReviverOptions } from '@ama-sdk/core';

/** */
export function revivePet<T extends Pet = Pet>(data: undefined, dictionaries?: any, options?: ReviverOptions): undefined;
export function revivePet(data: Pet, dictionaries?: any, options?: ReviverOptions): Pet ;
export function revivePet(data: any, dictionaries?: any, options?: ReviverOptions): Pet | undefined;
export function revivePet<T extends Pet>(data: T, dictionaries?: any, options?: ReviverOptions): T ;
export function revivePet<T extends Pet>(data: any, dictionaries?: any, options?: ReviverOptions): T | undefined;
/** */
export function revivePet<T extends Pet = Pet>(data: any, dictionaries?: any, options?: ReviverOptions): T | undefined {
  if (!data) { return ; }
  data = {
    ...baseRevivePet(data, dictionaries),
    id: data.id || Date.now()
  };
  return data as T;
}
