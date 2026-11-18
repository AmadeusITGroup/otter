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
  /**
   * Whether a node has primary axis scrolling, horizontal or vertical.
   * @default 'NONE'
   */
  overflowDirection?: OverflowDirectionEnum;
  /**
   * Whether this layer uses auto-layout to position its children.
   * @default 'NONE'
   */
  layoutMode?: LayoutModeEnum;
  /**
   * Whether the primary axis has a fixed length (determined by the user) or an automatic length (determined by the layout engine). This property is only applicable for auto-layout frames.
   * @default 'AUTO'
   */
  primaryAxisSizingMode?: PrimaryAxisSizingModeEnum;
  /**
   * Whether the counter axis has a fixed length (determined by the user) or an automatic length (determined by the layout engine). This property is only applicable for auto-layout frames.
   * @default 'AUTO'
   */
  counterAxisSizingMode?: CounterAxisSizingModeEnum;
  /**
   * Determines how the auto-layout frame's children should be aligned in the primary axis direction. This property is only applicable for auto-layout frames.
   * @default 'MIN'
   */
  primaryAxisAlignItems?: PrimaryAxisAlignItemsEnum;
  /**
   * Determines how the auto-layout frame's children should be aligned in the counter axis direction. This property is only applicable for auto-layout frames.
   * @default 'MIN'
   */
  counterAxisAlignItems?: CounterAxisAlignItemsEnum;
  /**
   * The padding between the left border of the frame and its children. This property is only applicable for auto-layout frames.
   * @default 0
   */
  paddingLeft?: number;
  /**
   * The padding between the right border of the frame and its children. This property is only applicable for auto-layout frames.
   * @default 0
   */
  paddingRight?: number;
  /**
   * The padding between the top border of the frame and its children. This property is only applicable for auto-layout frames.
   * @default 0
   */
  paddingTop?: number;
  /**
   * The padding between the bottom border of the frame and its children. This property is only applicable for auto-layout frames.
   * @default 0
   */
  paddingBottom?: number;
  /**
   * The distance between children of the frame. Can be negative. This property is only applicable for auto-layout frames.
   * @default 0
   */
  itemSpacing?: number;
  /**
   * Determines the canvas stacking order of layers in this frame. When true, the first layer will be draw on top. This property is only applicable for auto-layout frames.
   * @default false
   */
  itemReverseZIndex?: boolean;
  /**
   * Determines whether strokes are included in layout calculations. When true, auto-layout frames behave like css "box-sizing: border-box". This property is only applicable for auto-layout frames.
   * @default false
   */
  strokesIncludedInLayout?: boolean;
  /** Whether this auto-layout frame has wrapping enabled. */
  layoutWrap?: LayoutWrapEnum;
  /** The distance between wrapped tracks of an auto-layout frame. This property is only applicable for auto-layout frames with `layoutWrap: "WRAP"` */
  counterAxisSpacing?: number;
  /**
   * Determines how the auto-layout frame’s wrapped tracks should be aligned in the counter axis direction. This property is only applicable for auto-layout frames with `layoutWrap: "WRAP"`.
   * @default 'AUTO'
   */
  counterAxisAlignContent?: CounterAxisAlignContentEnum;
}

/** Array of OverflowDirectionEnum items */
export const LIST_OVERFLOW_DIRECTION_ENUM = ['HORIZONTAL_SCROLLING', 'VERTICAL_SCROLLING', 'HORIZONTAL_AND_VERTICAL_SCROLLING', 'NONE'] as const;

/** List of available values for OverflowDirectionEnum */
export type OverflowDirectionEnum = 'HORIZONTAL_SCROLLING' | 'VERTICAL_SCROLLING' | 'HORIZONTAL_AND_VERTICAL_SCROLLING' | 'NONE';
/** Array of LayoutModeEnum items */
export const LIST_LAYOUT_MODE_ENUM = ['NONE', 'HORIZONTAL', 'VERTICAL'] as const;

/** List of available values for LayoutModeEnum */
export type LayoutModeEnum = 'NONE' | 'HORIZONTAL' | 'VERTICAL';
/** Array of PrimaryAxisSizingModeEnum items */
export const LIST_PRIMARY_AXIS_SIZING_MODE_ENUM = ['FIXED', 'AUTO'] as const;

/** List of available values for PrimaryAxisSizingModeEnum */
export type PrimaryAxisSizingModeEnum = 'FIXED' | 'AUTO';
/** Array of CounterAxisSizingModeEnum items */
export const LIST_COUNTER_AXIS_SIZING_MODE_ENUM = ['FIXED', 'AUTO'] as const;

/** List of available values for CounterAxisSizingModeEnum */
export type CounterAxisSizingModeEnum = 'FIXED' | 'AUTO';
/** Array of PrimaryAxisAlignItemsEnum items */
export const LIST_PRIMARY_AXIS_ALIGN_ITEMS_ENUM = ['MIN', 'CENTER', 'MAX', 'SPACE_BETWEEN'] as const;

/** List of available values for PrimaryAxisAlignItemsEnum */
export type PrimaryAxisAlignItemsEnum = 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
/** Array of CounterAxisAlignItemsEnum items */
export const LIST_COUNTER_AXIS_ALIGN_ITEMS_ENUM = ['MIN', 'CENTER', 'MAX', 'BASELINE'] as const;

/** List of available values for CounterAxisAlignItemsEnum */
export type CounterAxisAlignItemsEnum = 'MIN' | 'CENTER' | 'MAX' | 'BASELINE';
/** Array of LayoutWrapEnum items */
export const LIST_LAYOUT_WRAP_ENUM = ['NO_WRAP', 'WRAP'] as const;

/** List of available values for LayoutWrapEnum */
export type LayoutWrapEnum = 'NO_WRAP' | 'WRAP';
/** Array of CounterAxisAlignContentEnum items */
export const LIST_COUNTER_AXIS_ALIGN_CONTENT_ENUM = ['AUTO', 'SPACE_BETWEEN'] as const;

/** List of available values for CounterAxisAlignContentEnum */
export type CounterAxisAlignContentEnum = 'AUTO' | 'SPACE_BETWEEN';

