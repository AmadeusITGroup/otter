/**
 * Model: Effect
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { BlurEffect } from '../blur-effect';
import { DropShadowEffect } from '../drop-shadow-effect';
import { InnerShadowEffect } from '../inner-shadow-effect';
import { NoiseEffect } from '../noise-effect';
import { TextureEffect } from '../texture-effect';

export type Effect = BlurEffect | DropShadowEffect | InnerShadowEffect | NoiseEffect | TextureEffect;

/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['DROP_SHADOW', 'INNER_SHADOW', 'LAYER_BLUR', 'BACKGROUND_BLUR', 'TEXTURE', 'NOISE'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR' | 'TEXTURE' | 'NOISE';
/** Array of BlurTypeEnum items */
export const LIST_BLUR_TYPE_ENUM = ['PROGRESSIVE'] as const;

/** List of available values for BlurTypeEnum */
export type BlurTypeEnum = 'PROGRESSIVE';
/** Array of NoiseTypeEnum items */
export const LIST_NOISE_TYPE_ENUM = ['DUOTONE'] as const;

/** List of available values for NoiseTypeEnum */
export type NoiseTypeEnum = 'DUOTONE';

