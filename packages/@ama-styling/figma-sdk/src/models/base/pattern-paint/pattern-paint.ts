/**
 * Model: PatternPaint
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { BlendMode } from '../blend-mode';
import { Vector } from '../vector';

export interface PatternPaint {
  /** Is the paint enabled? */
  visible?: boolean;
  /** Overall opacity of paint (colors within the paint can also have opacity values which would blend with this) */
  opacity?: number;
  /** @see BlendMode */
  blendMode: BlendMode;
  /** The string literal \"PATTERN\" representing the paint's type. Always check the `type` before reading other properties. */
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

export type TypeEnum = 'PATTERN';
export type TileTypeEnum = 'RECTANGULAR' | 'HORIZONTAL_HEXAGONAL' | 'VERTICAL_HEXAGONAL';
export type HorizontalAlignmentEnum = 'START' | 'CENTER' | 'END';
export type VerticalAlignmentEnum = 'START' | 'CENTER' | 'END';

