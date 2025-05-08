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

export type TypeEnum = 'DISSOLVE' | 'SMART_ANIMATE' | 'SCROLL_ANIMATE';

