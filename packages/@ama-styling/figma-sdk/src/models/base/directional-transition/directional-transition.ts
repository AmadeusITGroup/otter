/**
 * Model: DirectionalTransition
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { Easing } from '../easing';

/**
 * Describes an animation used when navigating in a prototype.
 */
export interface DirectionalTransition {
  /** @see TypeEnum */
  type: TypeEnum;
  /** @see DirectionEnum */
  direction: DirectionEnum;
  /** The duration of the transition in milliseconds. */
  duration: number;
  /** @see Easing */
  easing: Easing;
  /** When the transition `type` is `\"SMART_ANIMATE\"` or when `matchLayers` is `true`, then the transition will be performed using smart animate, which attempts to match corresponding layers an interpolate other properties during the animation. */
  matchLayers?: boolean;
}

export type TypeEnum = 'MOVE_IN' | 'MOVE_OUT' | 'PUSH' | 'SLIDE_IN' | 'SLIDE_OUT';
export type DirectionEnum = 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM';

