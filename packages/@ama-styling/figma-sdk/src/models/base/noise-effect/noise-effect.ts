/**
 * Model: NoiseEffect
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { DuotoneNoiseEffect } from '../duotone-noise-effect';
import { MonotoneNoiseEffect } from '../monotone-noise-effect';
import { MultitoneNoiseEffect } from '../multitone-noise-effect';

export type NoiseEffect = DuotoneNoiseEffect | MonotoneNoiseEffect | MultitoneNoiseEffect;

/** Array of NoiseTypeEnum items */
export const LIST_NOISE_TYPE_ENUM = ['DUOTONE'] as const;

/** List of available values for NoiseTypeEnum */
export type NoiseTypeEnum = 'DUOTONE';
/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['NOISE'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'NOISE';

