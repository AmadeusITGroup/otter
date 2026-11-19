/**
 * Model: Transition
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { DirectionalTransition } from '../directional-transition';
import { SimpleTransition } from '../simple-transition';

export type Transition = DirectionalTransition | SimpleTransition;

/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['DISSOLVE', 'SMART_ANIMATE', 'SCROLL_ANIMATE', 'MOVE_IN', 'MOVE_OUT', 'PUSH', 'SLIDE_IN', 'SLIDE_OUT'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'DISSOLVE' | 'SMART_ANIMATE' | 'SCROLL_ANIMATE' | 'MOVE_IN' | 'MOVE_OUT' | 'PUSH' | 'SLIDE_IN' | 'SLIDE_OUT';
/** Array of DirectionEnum items */
export const LIST_DIRECTION_ENUM = ['LEFT', 'RIGHT', 'TOP', 'BOTTOM'] as const;

/** List of available values for DirectionEnum */
export type DirectionEnum = 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM';

