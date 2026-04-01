/**
 * Model: Cat
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */
import type { Animal } from '../animal';

export interface Cat extends Animal {
  hunts?: boolean;
  age?: number;

  /** @see Animal.petType */
  petType: 'cat';

}

/** Array of PetTypeEnum items */
export const LIST_PET_TYPE_ENUM = ['cat', 'dog'] as const;

/** List of available values for PetTypeEnum */

export type PetTypeEnum = typeof LIST_PET_TYPE_ENUM[number];
/**
 * Type guard for Cat implementing the discriminator logic
 * @param data The data to check
 * @returns True if the data is of type Cat, false otherwise
 */
export const isCat = (data: Animal): data is Cat => {
  return data['petType'] === 'cat';
};
