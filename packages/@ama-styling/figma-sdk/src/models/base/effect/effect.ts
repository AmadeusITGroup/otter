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

export type TypeEnum = 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR' | 'TEXTURE' | 'NOISE';
export type BlurTypeEnum = 'PROGRESSIVE';
export type NoiseTypeEnum = 'DUOTONE';

