/**
 * Model: HasFramePropertiesTrait
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { LayoutGrid } from '../layout-grid';
import { Paint } from '../paint';
import { RGBA } from '../r-g-b-a';

export interface HasFramePropertiesTrait {
  /** Whether or not this node clip content outside of its bounds */
  clipsContent: boolean;
  /** Background of the node. This is deprecated, as backgrounds for frames are now in the `fills` field. */
  background?: Paint[];
  /** @see RGBA */
  backgroundColor?: RGBA;
  /** An array of layout grids attached to this node (see layout grids section for more details). GROUP nodes do not have this attribute */
  layoutGrids?: LayoutGrid[];
  /** Whether a node has primary axis scrolling, horizontal or vertical. */
  overflowDirection?: OverflowDirectionEnum;
  /** Whether this layer uses auto-layout to position its children. */
  layoutMode?: LayoutModeEnum;
  /** Whether the primary axis has a fixed length (determined by the user) or an automatic length (determined by the layout engine). This property is only applicable for auto-layout frames. */
  primaryAxisSizingMode?: PrimaryAxisSizingModeEnum;
  /** Whether the counter axis has a fixed length (determined by the user) or an automatic length (determined by the layout engine). This property is only applicable for auto-layout frames. */
  counterAxisSizingMode?: CounterAxisSizingModeEnum;
  /** Determines how the auto-layout frame's children should be aligned in the primary axis direction. This property is only applicable for auto-layout frames. */
  primaryAxisAlignItems?: PrimaryAxisAlignItemsEnum;
  /** Determines how the auto-layout frame's children should be aligned in the counter axis direction. This property is only applicable for auto-layout frames. */
  counterAxisAlignItems?: CounterAxisAlignItemsEnum;
  /** The padding between the left border of the frame and its children. This property is only applicable for auto-layout frames. */
  paddingLeft?: number;
  /** The padding between the right border of the frame and its children. This property is only applicable for auto-layout frames. */
  paddingRight?: number;
  /** The padding between the top border of the frame and its children. This property is only applicable for auto-layout frames. */
  paddingTop?: number;
  /** The padding between the bottom border of the frame and its children. This property is only applicable for auto-layout frames. */
  paddingBottom?: number;
  /** The distance between children of the frame. Can be negative. This property is only applicable for auto-layout frames. */
  itemSpacing?: number;
  /** Determines the canvas stacking order of layers in this frame. When true, the first layer will be draw on top. This property is only applicable for auto-layout frames. */
  itemReverseZIndex?: boolean;
  /** Determines whether strokes are included in layout calculations. When true, auto-layout frames behave like css \"box-sizing: border-box\". This property is only applicable for auto-layout frames. */
  strokesIncludedInLayout?: boolean;
  /** Whether this auto-layout frame has wrapping enabled. */
  layoutWrap?: LayoutWrapEnum;
  /** The distance between wrapped tracks of an auto-layout frame. This property is only applicable for auto-layout frames with `layoutWrap: \"WRAP\"` */
  counterAxisSpacing?: number;
  /** Determines how the auto-layout frame’s wrapped tracks should be aligned in the counter axis direction. This property is only applicable for auto-layout frames with `layoutWrap: \"WRAP\"`. */
  counterAxisAlignContent?: CounterAxisAlignContentEnum;
}

export type OverflowDirectionEnum = 'HORIZONTAL_SCROLLING' | 'VERTICAL_SCROLLING' | 'HORIZONTAL_AND_VERTICAL_SCROLLING' | 'NONE';
export type LayoutModeEnum = 'NONE' | 'HORIZONTAL' | 'VERTICAL';
export type PrimaryAxisSizingModeEnum = 'FIXED' | 'AUTO';
export type CounterAxisSizingModeEnum = 'FIXED' | 'AUTO';
export type PrimaryAxisAlignItemsEnum = 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
export type CounterAxisAlignItemsEnum = 'MIN' | 'CENTER' | 'MAX' | 'BASELINE';
export type LayoutWrapEnum = 'NO_WRAP' | 'WRAP';
export type CounterAxisAlignContentEnum = 'AUTO' | 'SPACE_BETWEEN';

