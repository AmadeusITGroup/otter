/**
 * Model: NodeActionTransition
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { Transition } from '../transition';

export type NodeActionTransition = Transition | string;

/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['MOVE_IN', 'MOVE_OUT', 'PUSH', 'SLIDE_IN', 'SLIDE_OUT'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'MOVE_IN' | 'MOVE_OUT' | 'PUSH' | 'SLIDE_IN' | 'SLIDE_OUT';
/** Array of DirectionEnum items */
export const LIST_DIRECTION_ENUM = ['LEFT', 'RIGHT', 'TOP', 'BOTTOM'] as const;

/** List of available values for DirectionEnum */
export type DirectionEnum = 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM';

