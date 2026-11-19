/**
 * Model: BlurEffect
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { NormalBlurEffect } from '../normal-blur-effect';
import { ProgressiveBlurEffect } from '../progressive-blur-effect';

export type BlurEffect = NormalBlurEffect | ProgressiveBlurEffect;

/** Array of BlurTypeEnum items */
export const LIST_BLUR_TYPE_ENUM = ['PROGRESSIVE'] as const;

/** List of available values for BlurTypeEnum */
export type BlurTypeEnum = 'PROGRESSIVE';
/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['LAYER_BLUR', 'BACKGROUND_BLUR'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'LAYER_BLUR' | 'BACKGROUND_BLUR';

