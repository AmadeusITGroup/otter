/**
 * Model: Easing
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { EasingEasingFunctionCubicBezier } from '../easing-easing-function-cubic-bezier';
import { EasingEasingFunctionSpring } from '../easing-easing-function-spring';
import { EasingType } from '../easing-type';

/**
 * Describes an easing curve.
 */
export interface Easing {
  /** @see EasingType */
  type: EasingType;
  /** @see EasingEasingFunctionCubicBezier */
  easingFunctionCubicBezier?: EasingEasingFunctionCubicBezier;
  /** @see EasingEasingFunctionSpring */
  easingFunctionSpring?: EasingEasingFunctionSpring;
}


