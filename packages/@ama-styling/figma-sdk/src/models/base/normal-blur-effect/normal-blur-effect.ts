/**
 * Model: NormalBlurEffect
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { BaseBlurEffectBoundVariables } from '../base-blur-effect-bound-variables';

export interface NormalBlurEffect {
  /** A string literal representing the effect's type. Always check the type before reading other properties. */
  type: TypeEnum;
  /** Whether this blur is active. */
  visible: boolean;
  /** Radius of the blur effect */
  radius: number;
  /** @see BaseBlurEffectBoundVariables */
  boundVariables?: BaseBlurEffectBoundVariables;
  /** The string literal 'NORMAL' representing the blur type. Always check the blurType before reading other properties. */
  blurType?: BlurTypeEnum;
}

export type TypeEnum = 'LAYER_BLUR' | 'BACKGROUND_BLUR';
export type BlurTypeEnum = 'NORMAL';

