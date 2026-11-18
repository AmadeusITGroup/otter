/**
 * Model: TableNode
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { BlendMode } from '../blend-mode';
import { Effect } from '../effect';
import { ExportSetting } from '../export-setting';
import { HasLayoutTraitAbsoluteBoundingBox } from '../has-layout-trait-absolute-bounding-box';
import { HasLayoutTraitAbsoluteRenderBounds } from '../has-layout-trait-absolute-render-bounds';
import { IsLayerTraitBoundVariables } from '../is-layer-trait-bound-variables';
import { LayoutConstraint } from '../layout-constraint';
import { Paint } from '../paint';
import { SubcanvasNode } from '../subcanvas-node';
import { Vector } from '../vector';

export interface TableNode {
  /** A string uniquely identifying this node within the document. */
  id: string;
  /** The name given to the node by the user in the tool. */
  name: string;
  /** The type of this node, represented by the string literal "TABLE" */
  type: TypeEnum;
  /**
   * Whether or not the node is visible on the canvas.
   * @default true
   */
  visible?: boolean;
  /**
   * If true, layer is locked and cannot be edited
   * @default false
   */
  locked?: boolean;
  /**
   * Whether the layer is fixed while the parent is scrolling
   * @default false
   */
  isFixed?: boolean;
  /**
   * How layer should be treated when the frame is resized
   * @default 'SCROLLS'
   */
  scrollBehavior: ScrollBehaviorEnum;
  /**
   * The rotation of the node, if not 0.
   * @default 0
   */
  rotation?: number;
  /** A mapping of a layer's property to component property name of component properties attached to this node. The component property name can be used to look up more information on the corresponding component's or component set's componentPropertyDefinitions. */
  componentPropertyReferences?: Record<string, string>;
  /** Data written by plugins that is visible only to the plugin that wrote it. Requires the `pluginData` to include the ID of the plugin. */
  pluginData?: any;
  /** Data written by plugins that is visible to all plugins. Requires the `pluginData` parameter to include the string "shared". */
  sharedPluginData?: any;
  /** @see IsLayerTraitBoundVariables */
  boundVariables?: IsLayerTraitBoundVariables;
  /** A mapping of variable collection ID to mode ID representing the explicitly set modes for this node. */
  explicitVariableModes?: Record<string, string>;
  /** An array of nodes that are direct children of this node */
  children: SubcanvasNode[];
  /** @see HasLayoutTraitAbsoluteBoundingBox */
  absoluteBoundingBox: HasLayoutTraitAbsoluteBoundingBox;
  /** @see HasLayoutTraitAbsoluteRenderBounds */
  absoluteRenderBounds: HasLayoutTraitAbsoluteRenderBounds;
  /**
   * Keep height and width constrained to same ratio.
   * @default false
   */
  preserveRatio?: boolean;
  /** @see LayoutConstraint */
  constraints?: LayoutConstraint;
  /** A transformation matrix is standard way in computer graphics to represent translation and rotation. These are the top two rows of a 3x3 matrix. The bottom row of the matrix is assumed to be [0, 0, 1]. This is known as an affine transform and is enough to represent translation, rotation, and skew.  The identity transform is [[1, 0, 0], [0, 1, 0]].  A translation matrix will typically look like:  ``` [[1, 0, tx],   [0, 1, ty]] ```  and a rotation matrix will typically look like:  ``` [[cos(angle), sin(angle), 0],   [-sin(angle), cos(angle), 0]] ```  Another way to think about this transform is as three vectors:  - The x axis (t[0][0], t[1][0]) - The y axis (t[0][1], t[1][1]) - The translation offset (t[0][2], t[1][2])  The most common usage of the Transform matrix is the `relativeTransform property`. This particular usage of the matrix has a few additional restrictions. The translation offset can take on any value but we do enforce that the axis vectors are unit vectors (i.e. have length 1). The axes are not required to be at 90° angles to each other. */
  relativeTransform?: number[][];
  /** @see Vector */
  size?: Vector;
  /**  Determines if the layer should stretch along the parent's counter axis. This property is only provided for direct children of auto-layout frames.  - `INHERIT` - `STRETCH`  In previous versions of auto layout, determined how the layer is aligned inside an auto-layout frame. This property is only provided for direct children of auto-layout frames.  - `MIN` - `CENTER` - `MAX` - `STRETCH`  In horizontal auto-layout frames, "MIN" and "MAX" correspond to "TOP" and "BOTTOM". In vertical auto-layout frames, "MIN" and "MAX" correspond to "LEFT" and "RIGHT". */
  layoutAlign?: LayoutAlignEnum;
  /**
   * This property is applicable only for direct children of auto-layout frames, ignored otherwise. Determines whether a layer should stretch along the parent's primary axis. A `0` corresponds to a fixed size and `1` corresponds to stretch.
   * @default 0
   */
  layoutGrow?: LayoutGrowEnum;
  /**
   * Determines whether a layer's size and position should be determined by auto-layout settings or manually adjustable.
   * @default 'AUTO'
   */
  layoutPositioning?: LayoutPositioningEnum;
  /**
   * The minimum width of the frame. This property is only applicable for auto-layout frames or direct children of auto-layout frames.
   * @default 0
   */
  minWidth?: number;
  /**
   * The maximum width of the frame. This property is only applicable for auto-layout frames or direct children of auto-layout frames.
   * @default 0
   */
  maxWidth?: number;
  /**
   * The minimum height of the frame. This property is only applicable for auto-layout frames or direct children of auto-layout frames.
   * @default 0
   */
  minHeight?: number;
  /**
   * The maximum height of the frame. This property is only applicable for auto-layout frames or direct children of auto-layout frames.
   * @default 0
   */
  maxHeight?: number;
  /** The horizontal sizing setting on this auto-layout frame or frame child. - `FIXED` - `HUG`: only valid on auto-layout frames and text nodes - `FILL`: only valid on auto-layout frame children */
  layoutSizingHorizontal?: LayoutSizingHorizontalEnum;
  /** The vertical sizing setting on this auto-layout frame or frame child. - `FIXED` - `HUG`: only valid on auto-layout frames and text nodes - `FILL`: only valid on auto-layout frame children */
  layoutSizingVertical?: LayoutSizingVerticalEnum;
  /** An array of stroke paints applied to the node. */
  strokes?: Paint[];
  /**
   * The weight of strokes on the node.
   * @default 1
   */
  strokeWeight?: number;
  /** Position of stroke relative to vector outline, as a string enum  - `INSIDE`: stroke drawn inside the shape boundary - `OUTSIDE`: stroke drawn outside the shape boundary - `CENTER`: stroke drawn centered along the shape boundary */
  strokeAlign?: StrokeAlignEnum;
  /**
   * A string enum with value of "MITER", "BEVEL", or "ROUND", describing how corners in vector paths are rendered.
   * @default 'MITER'
   */
  strokeJoin?: StrokeJoinEnum;
  /** An array of floating point numbers describing the pattern of dash length and gap lengths that the vector stroke will use when drawn.  For example a value of [1, 2] indicates that the stroke will be drawn with a dash of length 1 followed by a gap of length 2, repeated. */
  strokeDashes?: number[];
  /** An array of effects attached to this node (see effects section for more details) */
  effects: Effect[];
  /** @see BlendMode */
  blendMode: BlendMode;
  /**
   * Opacity of the node
   * @default 1
   */
  opacity?: number;
  /** An array of export settings representing images to export from the node. */
  exportSettings?: ExportSetting[];
}

/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['TABLE'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'TABLE';
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

