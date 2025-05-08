/**
 * Model: HasLayoutTrait
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { HasLayoutTraitAbsoluteBoundingBox } from '../has-layout-trait-absolute-bounding-box';
import { HasLayoutTraitAbsoluteRenderBounds } from '../has-layout-trait-absolute-render-bounds';
import { LayoutConstraint } from '../layout-constraint';
import { Vector } from '../vector';

export interface HasLayoutTrait {
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
}

export type LayoutAlignEnum = 'INHERIT' | 'STRETCH' | 'MIN' | 'CENTER' | 'MAX';
export type LayoutGrowEnum = '0' | '1';
export type LayoutPositioningEnum = 'AUTO' | 'ABSOLUTE';
export type LayoutSizingHorizontalEnum = 'FIXED' | 'HUG' | 'FILL';
export type LayoutSizingVerticalEnum = 'FIXED' | 'HUG' | 'FILL';

