/**
 * Model: PatternPaint
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { BlendMode } from '../blend-mode';
import { Vector } from '../vector';

export interface PatternPaint {
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
  /** The string literal "PATTERN" representing the paint's type. Always check the `type` before reading other properties. */
  type: TypeEnum;
  /** The node id of the source node for the pattern */
  sourceNodeId: string;
  /** The tile type for the pattern */
  tileType: TileTypeEnum;
  /** The scaling factor for the pattern */
  scalingFactor: number;
  /** @see Vector */
  spacing: Vector;
  /** The horizontal alignment for the pattern */
  horizontalAlignment: HorizontalAlignmentEnum;
  /** The vertical alignment for the pattern */
  verticalAlignment: VerticalAlignmentEnum;
}

/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['PATTERN'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'PATTERN';
/** Array of TileTypeEnum items */
export const LIST_TILE_TYPE_ENUM = ['RECTANGULAR', 'HORIZONTAL_HEXAGONAL', 'VERTICAL_HEXAGONAL'] as const;

/** List of available values for TileTypeEnum */
export type TileTypeEnum = 'RECTANGULAR' | 'HORIZONTAL_HEXAGONAL' | 'VERTICAL_HEXAGONAL';
/** Array of HorizontalAlignmentEnum items */
export const LIST_HORIZONTAL_ALIGNMENT_ENUM = ['START', 'CENTER', 'END'] as const;

/** List of available values for HorizontalAlignmentEnum */
export type HorizontalAlignmentEnum = 'START' | 'CENTER' | 'END';
/** Array of VerticalAlignmentEnum items */
export const LIST_VERTICAL_ALIGNMENT_ENUM = ['START', 'CENTER', 'END'] as const;

/** List of available values for VerticalAlignmentEnum */
export type VerticalAlignmentEnum = 'START' | 'CENTER' | 'END';

