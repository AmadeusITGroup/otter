/**
 * Model: SolidPaint
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { BlendMode } from '../blend-mode';
import { RGBA } from '../r-g-b-a';
import { SolidPaintBoundVariables } from '../solid-paint-bound-variables';

export interface SolidPaint {
  /**
   * Is the paint enabled?
   * @default true
   */
  visible?: boolean;
  /**
   * Overall opacity of paint (colors within the paint can also have opacity values which would blend with this)
   * @default 1
   */
  opacity?: number;
  /** @see BlendMode */
  blendMode: BlendMode;
  /** The string literal "SOLID" representing the paint's type. Always check the `type` before reading other properties. */
  type: TypeEnum;
  /** @see RGBA */
  color: RGBA;
  /** @see SolidPaintBoundVariables */
  boundVariables?: SolidPaintBoundVariables;
}

/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['SOLID'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'SOLID';

