/**
 * Model: PrototypeDevice
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { Size } from '../size';

/**
 * The device used to view a prototype.
 */
export interface PrototypeDevice {
  /** @see TypeEnum */
  type: TypeEnum;
  /** @see Size */
  size?: Size;
  presetIdentifier?: string;
  /** @see RotationEnum */
  rotation: RotationEnum;
}

export type TypeEnum = 'NONE' | 'PRESET' | 'CUSTOM' | 'PRESENTATION';
export type RotationEnum = 'NONE' | 'CCW_90';

