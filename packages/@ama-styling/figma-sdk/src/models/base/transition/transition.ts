/**
 * Model: Transition
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { DirectionalTransition } from '../directional-transition';
import { SimpleTransition } from '../simple-transition';

export type Transition = DirectionalTransition | SimpleTransition;

export type TypeEnum = 'DISSOLVE' | 'SMART_ANIMATE' | 'SCROLL_ANIMATE' | 'MOVE_IN' | 'MOVE_OUT' | 'PUSH' | 'SLIDE_IN' | 'SLIDE_OUT';
export type DirectionEnum = 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM';

