/**
 * Model: MonotoneNoiseEffect
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { BlendMode } from '../blend-mode';

export interface MonotoneNoiseEffect {
  /** The string literal 'NOISE' representing the effect's type. Always check the type before reading other properties. */
  type: TypeEnum;
  /** @see BlendMode */
  blendMode: BlendMode;
  /** The size of the noise effect */
  noiseSize: number;
  /** The density of the noise effect */
  density: number;
  /** The string literal 'MONOTONE' representing the noise type. */
  noiseType: NoiseTypeEnum;
}

/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['NOISE'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'NOISE';
/** Array of NoiseTypeEnum items */
export const LIST_NOISE_TYPE_ENUM = ['MONOTONE'] as const;

/** List of available values for NoiseTypeEnum */
export type NoiseTypeEnum = 'MONOTONE';

