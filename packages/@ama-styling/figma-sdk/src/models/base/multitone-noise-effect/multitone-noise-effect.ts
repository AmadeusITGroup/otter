/**
 * Model: MultitoneNoiseEffect
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { BlendMode } from '../blend-mode';

export interface MultitoneNoiseEffect {
  /** The string literal 'NOISE' representing the effect's type. Always check the type before reading other properties. */
  type: TypeEnum;
  /** @see BlendMode */
  blendMode: BlendMode;
  /** The size of the noise effect */
  noiseSize: number;
  /** The density of the noise effect */
  density: number;
  /** The string literal 'MULTITONE' representing the noise type. */
  noiseType: NoiseTypeEnum;
  /** The opacity of the noise effect */
  opacity: number;
}

export type TypeEnum = 'NOISE';
export type NoiseTypeEnum = 'MULTITONE';

