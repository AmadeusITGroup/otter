/**
 * Model: ProgressiveBlurEffect
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { BaseBlurEffectBoundVariables } from '../base-blur-effect-bound-variables';
import { Vector } from '../vector';

export interface ProgressiveBlurEffect {
  /** A string literal representing the effect's type. Always check the type before reading other properties. */
  type: TypeEnum;
  /** Whether this blur is active. */
  visible: boolean;
  /** Radius of the blur effect */
  radius: number;
  /** @see BaseBlurEffectBoundVariables */
  boundVariables?: BaseBlurEffectBoundVariables;
  /** The string literal 'PROGRESSIVE' representing the blur type. Always check the blurType before reading other properties. */
  blurType: BlurTypeEnum;
  /** The starting radius of the progressive blur */
  startRadius: number;
  /** @see Vector */
  startOffset: Vector;
  /** @see Vector */
  endOffset: Vector;
}

export type TypeEnum = 'LAYER_BLUR' | 'BACKGROUND_BLUR';
export type BlurTypeEnum = 'PROGRESSIVE';

