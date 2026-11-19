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

/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['NONE', 'PRESET', 'CUSTOM', 'PRESENTATION'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'NONE' | 'PRESET' | 'CUSTOM' | 'PRESENTATION';
/** Array of RotationEnum items */
export const LIST_ROTATION_ENUM = ['NONE', 'CCW_90'] as const;

/** List of available values for RotationEnum */
export type RotationEnum = 'NONE' | 'CCW_90';

