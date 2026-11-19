/**
 * Model: FrameOffsetRegion
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { Vector } from '../vector';

/**
 * Position of a region comment relative to the frame to which it is attached.
 */
export interface FrameOffsetRegion {
  /** Unique id specifying the frame. */
  node_id: string;
  /** @see Vector */
  node_offset: Vector;
  /** The height of the comment region. Must be greater than 0. */
  region_height: number;
  /** The width of the comment region. Must be greater than 0. */
  region_width: number;
  /**
   * The corner of the comment region to pin to the node's corner as a string enum.
   * @default 'bottom-right'
   */
  comment_pin_corner?: CommentPinCornerEnum;
}

/** Array of CommentPinCornerEnum items */
export const LIST_COMMENT_PIN_CORNER_ENUM = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;

/** List of available values for CommentPinCornerEnum */
export type CommentPinCornerEnum = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

