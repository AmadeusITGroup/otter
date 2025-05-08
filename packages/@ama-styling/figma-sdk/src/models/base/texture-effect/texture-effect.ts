/**
 * Model: TextureEffect
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * A texture effect
 */
export interface TextureEffect {
  /** The string literal 'TEXTURE' representing the effect's type. Always check the type before reading other properties. */
  type: TypeEnum;
  /** The size of the texture effect */
  noiseSize: number;
  /** The radius of the texture effect */
  radius: number;
  /** Whether the texture is clipped to the shape */
  clipToShape: boolean;
}

export type TypeEnum = 'TEXTURE';

