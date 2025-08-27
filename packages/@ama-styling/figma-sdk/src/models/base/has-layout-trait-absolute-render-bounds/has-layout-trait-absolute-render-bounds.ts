/**
 * Model: HasLayoutTraitAbsoluteRenderBounds
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { Rectangle } from '../rectangle';

/**
 * The actual bounds of a node accounting for drop shadows, thick strokes, and anything else that may fall outside the node's regular bounding box defined in `x`, `y`, `width`, and `height`. The `x` and `y` inside this property represent the absolute position of the node on the page. This value will be `null` if the node is invisible.
 */
export type HasLayoutTraitAbsoluteRenderBounds = Rectangle | string;


