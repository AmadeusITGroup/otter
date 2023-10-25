/**
 * Reviver: Pet
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 */
import { Pet } from './pet';
import { reviveCategory } from '../category';
import { Tag } from '../tag';
import { reviveTag } from '../tag';
import { reviveArray } from '@ama-sdk/core';

export function revivePet<T extends Pet = Pet>(data: undefined, dictionaries?: any): undefined;
export function revivePet(data: Pet, dictionaries?: any): Pet;
export function revivePet(data: any, dictionaries?: any): Pet | undefined;
export function revivePet<T extends Pet>(data: T, dictionaries?: any): T;
export function revivePet<T extends Pet>(data: any, dictionaries?: any): T | undefined;
/**
 *
 * @param data
 * @param dictionaries
 */
export function revivePet<T extends Pet = Pet>(data: any, dictionaries?: any): T | undefined {
  if (!data) { return; }
  data.category = reviveCategory(data.category, dictionaries);
  data.tags = reviveArray<Tag>(data.tags, dictionaries, reviveTag) as Tag[];
  return data as T;
}

