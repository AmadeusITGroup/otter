/**
 * Model: TransformGroupNode
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { BlendMode } from '../blend-mode';
import { DevStatusTraitDevStatus } from '../dev-status-trait-dev-status';
import { EasingType } from '../easing-type';
import { Effect } from '../effect';
import { ExportSetting } from '../export-setting';
import { HasGeometryTraitFillOverrideTable } from '../has-geometry-trait-fill-override-table';
import { HasLayoutTraitAbsoluteBoundingBox } from '../has-layout-trait-absolute-bounding-box';
import { HasLayoutTraitAbsoluteRenderBounds } from '../has-layout-trait-absolute-render-bounds';
import { Interaction } from '../interaction';
import { IsLayerTraitBoundVariables } from '../is-layer-trait-bound-variables';
import { LayoutConstraint } from '../layout-constraint';
import { LayoutGrid } from '../layout-grid';
import { Paint } from '../paint';
import { Path } from '../path';
import { RGBA } from '../r-g-b-a';
import { StrokeWeights } from '../stroke-weights';
import { SubcanvasNode } from '../subcanvas-node';
import { Vector } from '../vector';

export interface TransformGroupNode {
  /** A string uniquely identifying this node within the document. */
  id: string;
  /** The name given to the node by the user in the tool. */
  name: string;
  /** The type of this node, represented by the string literal \"TRANSFORM_GROUP\" */
  type: TypeEnum;
  /** Whether or not the node is visible on the canvas. */
  visible?: boolean;
  /** If true, layer is locked and cannot be edited */
  locked?: boolean;
  /** Whether the layer is fixed while the parent is scrolling */
  isFixed?: boolean;
  /** How layer should be treated when the frame is resized */
  scrollBehavior: ScrollBehaviorEnum;
  /** The rotation of the node, if not 0. */
  rotation?: number;
  /** A mapping of a layer's property to component property name of component properties attached to this node. The component property name can be used to look up more information on the corresponding component's or component set's componentPropertyDefinitions. */
  componentPropertyReferences?: { [key: string]: string; };
  /** Data written by plugins that is visible only to the plugin that wrote it. Requires the `pluginData` to include the ID of the plugin. */
  pluginData?: any;
  /** Data written by plugins that is visible to all plugins. Requires the `pluginData` parameter to include the string \"shared\". */
  sharedPluginData?: any;
  /** @see IsLayerTraitBoundVariables */
  boundVariables?: IsLayerTraitBoundVariables;
  /** A mapping of variable collection ID to mode ID representing the explicitly set modes for this node. */
  explicitVariableModes?: { [key: string]: string; };
  /** @see BlendMode */
  blendMode: BlendMode;
  /** Opacity of the node */
  opacity?: number;
  /** An array of nodes that are direct children of this node */
  children: SubcanvasNode[];
  /** @see HasLayoutTraitAbsoluteBoundingBox */
  absoluteBoundingBox: HasLayoutTraitAbsoluteBoundingBox;
  /** @see HasLayoutTraitAbsoluteRenderBounds */
  absoluteRenderBounds: HasLayoutTraitAbsoluteRenderBounds;
  /** Keep height and width constrained to same ratio. */
  preserveRatio?: boolean;
  /** @see LayoutConstraint */
  constraints?: LayoutConstraint;
  /** A transformation matrix is standard way in computer graphics to represent translation and rotation. These are the top two rows of a 3x3 matrix. The bottom row of the matrix is assumed to be [0, 0, 1]. This is known as an affine transform and is enough to represent translation, rotation, and skew.  The identity transform is [[1, 0, 0], [0, 1, 0]].  A translation matrix will typically look like:  ``` [[1, 0, tx],   [0, 1, ty]] ```  and a rotation matrix will typically look like:  ``` [[cos(angle), sin(angle), 0],   [-sin(angle), cos(angle), 0]] ```  Another way to think about this transform is as three vectors:  - The x axis (t[0][0], t[1][0]) - The y axis (t[0][1], t[1][1]) - The translation offset (t[0][2], t[1][2])  The most common usage of the Transform matrix is the `relativeTransform property`. This particular usage of the matrix has a few additional restrictions. The translation offset can take on any value but we do enforce that the axis vectors are unit vectors (i.e. have length 1). The axes are not required to be at 90° angles to each other. */
  relativeTransform?: number[][];
  /** @see Vector */
  size?: Vector;
  /**  Determines if the layer should stretch along the parent's counter axis. This property is only provided for direct children of auto-layout frames.  - `INHERIT` - `STRETCH`  In previous versions of auto layout, determined how the layer is aligned inside an auto-layout frame. This property is only provided for direct children of auto-layout frames.  - `MIN` - `CENTER` - `MAX` - `STRETCH`  In horizontal auto-layout frames, \"MIN\" and \"MAX\" correspond to \"TOP\" and \"BOTTOM\". In vertical auto-layout frames, \"MIN\" and \"MAX\" correspond to \"LEFT\" and \"RIGHT\". */
  layoutAlign?: LayoutAlignEnum;
  /** This property is applicable only for direct children of auto-layout frames, ignored otherwise. Determines whether a layer should stretch along the parent's primary axis. A `0` corresponds to a fixed size and `1` corresponds to stretch. */
  layoutGrow?: LayoutGrowEnum;
  /** Determines whether a layer's size and position should be determined by auto-layout settings or manually adjustable. */
  layoutPositioning?: LayoutPositioningEnum;
  /** The minimum width of the frame. This property is only applicable for auto-layout frames or direct children of auto-layout frames. */
  minWidth?: number;
  /** The maximum width of the frame. This property is only applicable for auto-layout frames or direct children of auto-layout frames. */
  maxWidth?: number;
  /** The minimum height of the frame. This property is only applicable for auto-layout frames or direct children of auto-layout frames. */
  minHeight?: number;
  /** The maximum height of the frame. This property is only applicable for auto-layout frames or direct children of auto-layout frames. */
  maxHeight?: number;
  /** The horizontal sizing setting on this auto-layout frame or frame child. - `FIXED` - `HUG`: only valid on auto-layout frames and text nodes - `FILL`: only valid on auto-layout frame children */
  layoutSizingHorizontal?: LayoutSizingHorizontalEnum;
  /** The vertical sizing setting on this auto-layout frame or frame child. - `FIXED` - `HUG`: only valid on auto-layout frames and text nodes - `FILL`: only valid on auto-layout frame children */
  layoutSizingVertical?: LayoutSizingVerticalEnum;
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
  /** Radius of each corner if a single radius is set for all corners */
  cornerRadius?: number;
  /** A value that lets you control how \"smooth\" the corners are. Ranges from 0 to 1. 0 is the default and means that the corner is perfectly circular. A value of 0.6 means the corner matches the iOS 7 \"squircle\" icon shape. Other values produce various other curves. */
  cornerSmoothing?: number;
  /** Array of length 4 of the radius of each corner of the frame, starting in the top left and proceeding clockwise.  Values are given in the order top-left, top-right, bottom-right, bottom-left. */
  rectangleCornerRadii?: number[];
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
  /** An array of export settings representing images to export from the node. */
  exportSettings?: ExportSetting[];
  /** An array of effects attached to this node (see effects section for more details) */
  effects: Effect[];
  /** Does this node mask sibling nodes in front of it? */
  isMask?: boolean;
  /** If this layer is a mask, this property describes the operation used to mask the layer's siblings. The value may be one of the following:  - ALPHA: the mask node's alpha channel will be used to determine the opacity of each pixel in the masked result. - VECTOR: if the mask node has visible fill paints, every pixel inside the node's fill regions will be fully visible in the masked result. If the mask has visible stroke paints, every pixel inside the node's stroke regions will be fully visible in the masked result. - LUMINANCE: the luminance value of each pixel of the mask node will be used to determine the opacity of that pixel in the masked result. */
  maskType?: MaskTypeEnum;
  /** True if maskType is VECTOR. This field is deprecated; use maskType instead. */
  isMaskOutline?: boolean;
  /** Node ID of node to transition to in prototyping */
  transitionNodeID?: string;
  /** The duration of the prototyping transition on this node (in milliseconds). This will override the default transition duration on the prototype, for this node. */
  transitionDuration?: number;
  /** @see EasingType */
  transitionEasing?: EasingType;
  /** List of Interactions */
  interactions?: Interaction[];
  /** @see StrokeWeights */
  individualStrokeWeights?: StrokeWeights;
  /** @see DevStatusTraitDevStatus */
  devStatus?: DevStatusTraitDevStatus;
}

export type TypeEnum = 'TRANSFORM_GROUP';
export type ScrollBehaviorEnum = 'SCROLLS' | 'FIXED' | 'STICKY_SCROLLS';
export type LayoutAlignEnum = 'INHERIT' | 'STRETCH' | 'MIN' | 'CENTER' | 'MAX';
export type LayoutGrowEnum = '0' | '1';
export type LayoutPositioningEnum = 'AUTO' | 'ABSOLUTE';
export type LayoutSizingHorizontalEnum = 'FIXED' | 'HUG' | 'FILL';
export type LayoutSizingVerticalEnum = 'FIXED' | 'HUG' | 'FILL';
export type OverflowDirectionEnum = 'HORIZONTAL_SCROLLING' | 'VERTICAL_SCROLLING' | 'HORIZONTAL_AND_VERTICAL_SCROLLING' | 'NONE';
export type LayoutModeEnum = 'NONE' | 'HORIZONTAL' | 'VERTICAL';
export type PrimaryAxisSizingModeEnum = 'FIXED' | 'AUTO';
export type CounterAxisSizingModeEnum = 'FIXED' | 'AUTO';
export type PrimaryAxisAlignItemsEnum = 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
export type CounterAxisAlignItemsEnum = 'MIN' | 'CENTER' | 'MAX' | 'BASELINE';
export type LayoutWrapEnum = 'NO_WRAP' | 'WRAP';
export type CounterAxisAlignContentEnum = 'AUTO' | 'SPACE_BETWEEN';
export type StrokeAlignEnum = 'INSIDE' | 'OUTSIDE' | 'CENTER';
export type StrokeJoinEnum = 'MITER' | 'BEVEL' | 'ROUND';
export type StrokeCapEnum = 'NONE' | 'ROUND' | 'SQUARE' | 'LINE_ARROW' | 'TRIANGLE_ARROW' | 'DIAMOND_FILLED' | 'CIRCLE_FILLED' | 'TRIANGLE_FILLED' | 'WASHI_TAPE_1' | 'WASHI_TAPE_2' | 'WASHI_TAPE_3' | 'WASHI_TAPE_4' | 'WASHI_TAPE_5' | 'WASHI_TAPE_6';
export type MaskTypeEnum = 'ALPHA' | 'VECTOR' | 'LUMINANCE';

