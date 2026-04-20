/**
 * Model: Animal
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */
import type { Cat } from '../cat';
import type { Dog } from '../dog';

export interface Animal {
  /** @see PetTypeEnum */
  petType: PetTypeEnum;

}

/** Array of PetTypeEnum items */
export const LIST_PET_TYPE_ENUM = ['cat', 'dog'] as const;

/** List of available values for PetTypeEnum */

export type PetTypeEnum = typeof LIST_PET_TYPE_ENUM[number];
/** Mapping between discriminator values and their corresponding types for Animal */
export type AnimalChildren = Cat | Dog;
