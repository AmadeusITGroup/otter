/**
 * Model: ImagePaint
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { BlendMode } from '../blend-mode';
import { ImageFilters } from '../image-filters';

export interface ImagePaint {
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
  /** The string literal "IMAGE" representing the paint's type. Always check the `type` before reading other properties. */
  type: TypeEnum;
  /** Image scaling mode. */
  scaleMode: ScaleModeEnum;
  /** A reference to an image embedded in this node. To download the image using this reference, use the `GET file images` endpoint to retrieve the mapping from image references to image URLs. */
  imageRef: string;
  /** A transformation matrix is standard way in computer graphics to represent translation and rotation. These are the top two rows of a 3x3 matrix. The bottom row of the matrix is assumed to be [0, 0, 1]. This is known as an affine transform and is enough to represent translation, rotation, and skew.  The identity transform is [[1, 0, 0], [0, 1, 0]].  A translation matrix will typically look like:  ``` [[1, 0, tx],   [0, 1, ty]] ```  and a rotation matrix will typically look like:  ``` [[cos(angle), sin(angle), 0],   [-sin(angle), cos(angle), 0]] ```  Another way to think about this transform is as three vectors:  - The x axis (t[0][0], t[1][0]) - The y axis (t[0][1], t[1][1]) - The translation offset (t[0][2], t[1][2])  The most common usage of the Transform matrix is the `relativeTransform property`. This particular usage of the matrix has a few additional restrictions. The translation offset can take on any value but we do enforce that the axis vectors are unit vectors (i.e. have length 1). The axes are not required to be at 90° angles to each other. */
  imageTransform?: number[][];
  /** Amount image is scaled by in tiling, only present if scaleMode is `TILE`. */
  scalingFactor?: number;
  /** @see ImageFilters */
  filters?: ImageFilters;
  /**
   * Image rotation, in degrees.
   * @default 0
   */
  rotation?: number;
  /** A reference to an animated GIF embedded in this node. To download the image using this reference, use the `GET file images` endpoint to retrieve the mapping from image references to image URLs. */
  gifRef?: string;
}

/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['IMAGE'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'IMAGE';
/** Array of ScaleModeEnum items */
export const LIST_SCALE_MODE_ENUM = ['FILL', 'FIT', 'TILE', 'STRETCH'] as const;

/** List of available values for ScaleModeEnum */
export type ScaleModeEnum = 'FILL' | 'FIT' | 'TILE' | 'STRETCH';

