/**
 * Model: SimpleTransition
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { Easing } from '../easing';

/**
 * Describes an animation used when navigating in a prototype.
 */
export interface SimpleTransition {
  /** @see TypeEnum */
  type: TypeEnum;
  /** The duration of the transition in milliseconds. */
  duration: number;
  /** @see Easing */
  easing: Easing;
}

/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['DISSOLVE', 'SMART_ANIMATE', 'SCROLL_ANIMATE'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'DISSOLVE' | 'SMART_ANIMATE' | 'SCROLL_ANIMATE';

