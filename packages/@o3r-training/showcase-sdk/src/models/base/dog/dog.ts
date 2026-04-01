/**
 * Model: Dog
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */
import type { Animal } from '../animal';

export interface Dog extends Animal {
  bark?: boolean;
  /** @see BreedEnum */
  breed?: BreedEnum;

  /** @see Animal.petType */
  petType: 'dog';

}

/** Array of PetTypeEnum items */
export const LIST_PET_TYPE_ENUM = ['cat', 'dog'] as const;

/** List of available values for PetTypeEnum */

export type PetTypeEnum = typeof LIST_PET_TYPE_ENUM[number];

/** Array of BreedEnum items */
export const LIST_BREED_ENUM = ['Dingo', 'Husky', 'Retriever', 'Shepherd'] as const;

/** List of available values for BreedEnum */

export type BreedEnum = typeof LIST_BREED_ENUM[number];
/**
 * Type guard for Dog implementing the discriminator logic
 * @param data The data to check
 * @returns True if the data is of type Dog, false otherwise
 */
export const isDog = (data: Animal): data is Dog => {
  return data['petType'] === 'dog';
};
