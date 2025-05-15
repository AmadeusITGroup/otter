/**
 * Model: HasGeometryTrait
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { HasGeometryTraitFillOverrideTable } from '../has-geometry-trait-fill-override-table';
import { Paint } from '../paint';
import { Path } from '../path';

export interface HasGeometryTrait {
  /** An array of fill paints applied to the node. */
  fills: Paint[];
  /** A mapping of a StyleType to style ID (see Style) of styles present on this node. The style ID can be used to look up more information about the style in the top-level styles field. */
  styles?: { [key: string]: string; };
  /** An array of stroke paints applied to the node. */
  strokes?: Paint[];
  /** The weight of strokes on the node. */
  strokeWeight?: number;
  /** Position of stroke relative to vector outline, as a string enum  - `INSIDE`: stroke drawn inside the shape boundary - `OUTSIDE`: stroke drawn outside the shape boundary - `CENTER`: stroke drawn centered along the shape boundary */
  strokeAlign?: StrokeAlignEnum;
  /** A string enum with value of \"MITER\", \"BEVEL\", or \"ROUND\", describing how corners in vector paths are rendered. */
  strokeJoin?: StrokeJoinEnum;
  /** An array of floating point numbers describing the pattern of dash length and gap lengths that the vector stroke will use when drawn.  For example a value of [1, 2] indicates that the stroke will be drawn with a dash of length 1 followed by a gap of length 2, repeated. */
  strokeDashes?: number[];
  /** Map from ID to PaintOverride for looking up fill overrides. To see which regions are overriden, you must use the `geometry=paths` option. Each path returned may have an `overrideID` which maps to this table. */
  fillOverrideTable?: { [key: string]: HasGeometryTraitFillOverrideTable; };
  /** Only specified if parameter `geometry=paths` is used. An array of paths representing the object fill. */
  fillGeometry?: Path[];
  /** Only specified if parameter `geometry=paths` is used. An array of paths representing the object stroke. */
  strokeGeometry?: Path[];
  /** A string enum describing the end caps of vector paths. */
  strokeCap?: StrokeCapEnum;
  /** Only valid if `strokeJoin` is \"MITER\". The corner angle, in degrees, below which `strokeJoin` will be set to \"BEVEL\" to avoid super sharp corners. By default this is 28.96 degrees. */
  strokeMiterAngle?: number;
}

export type StrokeAlignEnum = 'INSIDE' | 'OUTSIDE' | 'CENTER';
export type StrokeJoinEnum = 'MITER' | 'BEVEL' | 'ROUND';
export type StrokeCapEnum = 'NONE' | 'ROUND' | 'SQUARE' | 'LINE_ARROW' | 'TRIANGLE_ARROW' | 'DIAMOND_FILLED' | 'CIRCLE_FILLED' | 'TRIANGLE_FILLED' | 'WASHI_TAPE_1' | 'WASHI_TAPE_2' | 'WASHI_TAPE_3' | 'WASHI_TAPE_4' | 'WASHI_TAPE_5' | 'WASHI_TAPE_6';

