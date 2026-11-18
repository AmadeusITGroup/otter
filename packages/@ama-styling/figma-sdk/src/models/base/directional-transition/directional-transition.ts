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
  /** When the transition `type` is `"SMART_ANIMATE"` or when `matchLayers` is `true`, then the transition will be performed using smart animate, which attempts to match corresponding layers an interpolate other properties during the animation. */
  matchLayers?: boolean;
}

/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['MOVE_IN', 'MOVE_OUT', 'PUSH', 'SLIDE_IN', 'SLIDE_OUT'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'MOVE_IN' | 'MOVE_OUT' | 'PUSH' | 'SLIDE_IN' | 'SLIDE_OUT';
/** Array of DirectionEnum items */
export const LIST_DIRECTION_ENUM = ['LEFT', 'RIGHT', 'TOP', 'BOTTOM'] as const;

/** List of available values for DirectionEnum */
export type DirectionEnum = 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM';

