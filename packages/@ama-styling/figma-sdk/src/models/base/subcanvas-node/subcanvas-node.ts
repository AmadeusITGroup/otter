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

export type BooleanOperationEnum = 'UNION' | 'INTERSECT' | 'SUBTRACT' | 'EXCLUDE';
export type ScrollBehaviorEnum = 'SCROLLS' | 'FIXED' | 'STICKY_SCROLLS';
export type LayoutAlignEnum = 'INHERIT' | 'STRETCH' | 'MIN' | 'CENTER' | 'MAX';
export type LayoutGrowEnum = '0' | '1';
export type LayoutPositioningEnum = 'AUTO' | 'ABSOLUTE';
export type LayoutSizingHorizontalEnum = 'FIXED' | 'HUG' | 'FILL';
export type LayoutSizingVerticalEnum = 'FIXED' | 'HUG' | 'FILL';
export type StrokeAlignEnum = 'INSIDE' | 'OUTSIDE' | 'CENTER';
export type StrokeJoinEnum = 'MITER' | 'BEVEL' | 'ROUND';
export type StrokeCapEnum = 'NONE' | 'ROUND' | 'SQUARE' | 'LINE_ARROW' | 'TRIANGLE_ARROW' | 'DIAMOND_FILLED' | 'CIRCLE_FILLED' | 'TRIANGLE_FILLED' | 'WASHI_TAPE_1' | 'WASHI_TAPE_2' | 'WASHI_TAPE_3' | 'WASHI_TAPE_4' | 'WASHI_TAPE_5' | 'WASHI_TAPE_6';
export type MaskTypeEnum = 'ALPHA' | 'VECTOR' | 'LUMINANCE';
export type OverflowDirectionEnum = 'HORIZONTAL_SCROLLING' | 'VERTICAL_SCROLLING' | 'HORIZONTAL_AND_VERTICAL_SCROLLING' | 'NONE';
export type LayoutModeEnum = 'NONE' | 'HORIZONTAL' | 'VERTICAL';
export type PrimaryAxisSizingModeEnum = 'FIXED' | 'AUTO';
export type CounterAxisSizingModeEnum = 'FIXED' | 'AUTO';
export type PrimaryAxisAlignItemsEnum = 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
export type CounterAxisAlignItemsEnum = 'MIN' | 'CENTER' | 'MAX' | 'BASELINE';
export type LayoutWrapEnum = 'NO_WRAP' | 'WRAP';
export type CounterAxisAlignContentEnum = 'AUTO' | 'SPACE_BETWEEN';
export type ConnectorStartStrokeCapEnum = 'NONE' | 'LINE_ARROW' | 'TRIANGLE_ARROW' | 'DIAMOND_FILLED' | 'CIRCLE_FILLED' | 'TRIANGLE_FILLED';
export type ConnectorEndStrokeCapEnum = 'NONE' | 'LINE_ARROW' | 'TRIANGLE_ARROW' | 'DIAMOND_FILLED' | 'CIRCLE_FILLED' | 'TRIANGLE_FILLED';
export type LineTypesEnum = 'NONE' | 'ORDERED' | 'UNORDERED';

