/**
 * Model: Region
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * Position of a region comment on the canvas.
 */
export interface Region {
  /** X coordinate of the position. */
  x: number;
  /** Y coordinate of the position. */
  y: number;
  /** The height of the comment region. Must be greater than 0. */
  region_height: number;
  /** The width of the comment region. Must be greater than 0. */
  region_width: number;
  /** The corner of the comment region to pin to the node's corner as a string enum. */
  comment_pin_corner?: CommentPinCornerEnum;
}

export type CommentPinCornerEnum = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

