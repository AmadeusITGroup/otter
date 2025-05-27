/**
 * Model: DuotoneNoiseEffect
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { BlendMode } from '../blend-mode';
import { RGBA } from '../r-g-b-a';

export interface DuotoneNoiseEffect {
  /** The string literal 'NOISE' representing the effect's type. Always check the type before reading other properties. */
  type: TypeEnum;
  /** @see BlendMode */
  blendMode: BlendMode;
  /** The size of the noise effect */
  noiseSize: number;
  /** The density of the noise effect */
  density: number;
  /** The string literal 'DUOTONE' representing the noise type. */
  noiseType: NoiseTypeEnum;
  /** @see RGBA */
  secondaryColor: RGBA;
}

export type TypeEnum = 'NOISE';
export type NoiseTypeEnum = 'DUOTONE';

