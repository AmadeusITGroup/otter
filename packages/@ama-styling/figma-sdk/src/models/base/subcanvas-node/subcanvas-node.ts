/**
 * Model: SubcanvasNode
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { BooleanOperationNode } from '../boolean-operation-node';
import { ComponentNode } from '../component-node';
import { ComponentSetNode } from '../component-set-node';
import { ConnectorNode } from '../connector-node';
import { EllipseNode } from '../ellipse-node';
import { EmbedNode } from '../embed-node';
import { FrameNode } from '../frame-node';
import { GroupNode } from '../group-node';
import { InstanceNode } from '../instance-node';
import { LineNode } from '../line-node';
import { LinkUnfurlNode } from '../link-unfurl-node';
import { RectangleNode } from '../rectangle-node';
import { RegularPolygonNode } from '../regular-polygon-node';
import { SectionNode } from '../section-node';
import { ShapeWithTextNode } from '../shape-with-text-node';
import { SliceNode } from '../slice-node';
import { StarNode } from '../star-node';
import { StickyNode } from '../sticky-node';
import { TableCellNode } from '../table-cell-node';
import { TableNode } from '../table-node';
import { TextNode } from '../text-node';
import { TextPathNode } from '../text-path-node';
import { TransformGroupNode } from '../transform-group-node';
import { VectorNode } from '../vector-node';
import { WashiTapeNode } from '../washi-tape-node';
import { WidgetNode } from '../widget-node';

export type SubcanvasNode = BooleanOperationNode | ComponentNode | ComponentSetNode | ConnectorNode | EllipseNode | EmbedNode | FrameNode | GroupNode | InstanceNode | LineNode | LinkUnfurlNode | RectangleNode | RegularPolygonNode | SectionNode | ShapeWithTextNode | SliceNode | StarNode | StickyNode | TableCellNode | TableNode | TextNode | TextPathNode | TransformGroupNode | VectorNode | WashiTapeNode | WidgetNode;

/** Array of BooleanOperationEnum items */
export const LIST_BOOLEAN_OPERATION_ENUM = ['UNION', 'INTERSECT', 'SUBTRACT', 'EXCLUDE'] as const;

/** List of available values for BooleanOperationEnum */
export type BooleanOperationEnum = 'UNION' | 'INTERSECT' | 'SUBTRACT' | 'EXCLUDE';
/** Array of ScrollBehaviorEnum items */
export const LIST_SCROLL_BEHAVIOR_ENUM = ['SCROLLS', 'FIXED', 'STICKY_SCROLLS'] as const;

/** List of available values for ScrollBehaviorEnum */
export type ScrollBehaviorEnum = 'SCROLLS' | 'FIXED' | 'STICKY_SCROLLS';
/** Array of LayoutAlignEnum items */
export const LIST_LAYOUT_ALIGN_ENUM = ['INHERIT', 'STRETCH', 'MIN', 'CENTER', 'MAX'] as const;

/** List of available values for LayoutAlignEnum */
export type LayoutAlignEnum = 'INHERIT' | 'STRETCH' | 'MIN' | 'CENTER' | 'MAX';
/** Array of LayoutGrowEnum items */
export const LIST_LAYOUT_GROW_ENUM = ['0', '1'] as const;

/** List of available values for LayoutGrowEnum */
export type LayoutGrowEnum = '0' | '1';
/** Array of LayoutPositioningEnum items */
export const LIST_LAYOUT_POSITIONING_ENUM = ['AUTO', 'ABSOLUTE'] as const;

/** List of available values for LayoutPositioningEnum */
export type LayoutPositioningEnum = 'AUTO' | 'ABSOLUTE';
/** Array of LayoutSizingHorizontalEnum items */
export const LIST_LAYOUT_SIZING_HORIZONTAL_ENUM = ['FIXED', 'HUG', 'FILL'] as const;

/** List of available values for LayoutSizingHorizontalEnum */
export type LayoutSizingHorizontalEnum = 'FIXED' | 'HUG' | 'FILL';
/** Array of LayoutSizingVerticalEnum items */
export const LIST_LAYOUT_SIZING_VERTICAL_ENUM = ['FIXED', 'HUG', 'FILL'] as const;

/** List of available values for LayoutSizingVerticalEnum */
export type LayoutSizingVerticalEnum = 'FIXED' | 'HUG' | 'FILL';
/** Array of StrokeAlignEnum items */
export const LIST_STROKE_ALIGN_ENUM = ['INSIDE', 'OUTSIDE', 'CENTER'] as const;

/** List of available values for StrokeAlignEnum */
export type StrokeAlignEnum = 'INSIDE' | 'OUTSIDE' | 'CENTER';
/** Array of StrokeJoinEnum items */
export const LIST_STROKE_JOIN_ENUM = ['MITER', 'BEVEL', 'ROUND'] as const;

/** List of available values for StrokeJoinEnum */
export type StrokeJoinEnum = 'MITER' | 'BEVEL' | 'ROUND';
/** Array of StrokeCapEnum items */
export const LIST_STROKE_CAP_ENUM = ['NONE', 'ROUND', 'SQUARE', 'LINE_ARROW', 'TRIANGLE_ARROW', 'DIAMOND_FILLED', 'CIRCLE_FILLED', 'TRIANGLE_FILLED', 'WASHI_TAPE_1', 'WASHI_TAPE_2', 'WASHI_TAPE_3', 'WASHI_TAPE_4', 'WASHI_TAPE_5', 'WASHI_TAPE_6'] as const;

/** List of available values for StrokeCapEnum */
export type StrokeCapEnum = 'NONE' | 'ROUND' | 'SQUARE' | 'LINE_ARROW' | 'TRIANGLE_ARROW' | 'DIAMOND_FILLED' | 'CIRCLE_FILLED' | 'TRIANGLE_FILLED' | 'WASHI_TAPE_1' | 'WASHI_TAPE_2' | 'WASHI_TAPE_3' | 'WASHI_TAPE_4' | 'WASHI_TAPE_5' | 'WASHI_TAPE_6';
/** Array of MaskTypeEnum items */
export const LIST_MASK_TYPE_ENUM = ['ALPHA', 'VECTOR', 'LUMINANCE'] as const;

/** List of available values for MaskTypeEnum */
export type MaskTypeEnum = 'ALPHA' | 'VECTOR' | 'LUMINANCE';
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
/** Array of ConnectorStartStrokeCapEnum items */
export const LIST_CONNECTOR_START_STROKE_CAP_ENUM = ['NONE', 'LINE_ARROW', 'TRIANGLE_ARROW', 'DIAMOND_FILLED', 'CIRCLE_FILLED', 'TRIANGLE_FILLED'] as const;

/** List of available values for ConnectorStartStrokeCapEnum */
export type ConnectorStartStrokeCapEnum = 'NONE' | 'LINE_ARROW' | 'TRIANGLE_ARROW' | 'DIAMOND_FILLED' | 'CIRCLE_FILLED' | 'TRIANGLE_FILLED';
/** Array of ConnectorEndStrokeCapEnum items */
export const LIST_CONNECTOR_END_STROKE_CAP_ENUM = ['NONE', 'LINE_ARROW', 'TRIANGLE_ARROW', 'DIAMOND_FILLED', 'CIRCLE_FILLED', 'TRIANGLE_FILLED'] as const;

/** List of available values for ConnectorEndStrokeCapEnum */
export type ConnectorEndStrokeCapEnum = 'NONE' | 'LINE_ARROW' | 'TRIANGLE_ARROW' | 'DIAMOND_FILLED' | 'CIRCLE_FILLED' | 'TRIANGLE_FILLED';
/** Array of LineTypesEnum items */
export const LIST_LINE_TYPES_ENUM = ['NONE', 'ORDERED', 'UNORDERED'] as const;

/** List of available values for LineTypesEnum */
export type LineTypesEnum = 'NONE' | 'ORDERED' | 'UNORDERED';

