/**
 * Model: BaseBlurEffect
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { BaseBlurEffectBoundVariables } from '../base-blur-effect-bound-variables';

/**
 * Base properties shared by all blur effects
 */
export interface BaseBlurEffect {
  /** A string literal representing the effect's type. Always check the type before reading other properties. */
  type: TypeEnum;
  /** Whether this blur is active. */
  visible: boolean;
  /** Radius of the blur effect */
  radius: number;
  /** @see BaseBlurEffectBoundVariables */
  boundVariables?: BaseBlurEffectBoundVariables;
}

/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['LAYER_BLUR', 'BACKGROUND_BLUR'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'LAYER_BLUR' | 'BACKGROUND_BLUR';

