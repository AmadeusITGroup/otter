/**
 * Model: Pet
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { Category } from '../category';
import { Tag } from '../tag';

export interface Pet {
  id?: number;
  name: string;
  /** @see Category */
  category?: Category;
  /** List of strings */
  photoUrls: string[];
  /** List of Tags */
  tags?: Tag[];
  /** pet status in the store */
  status?: StatusEnum;
}

export type StatusEnum = 'available' | 'pending' | 'sold';

