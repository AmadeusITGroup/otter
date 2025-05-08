/**
 * Model: FrameOffset
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { Vector } from '../vector';

/**
 * Position of a comment relative to the frame to which it is attached.
 */
export interface FrameOffset {
  /** Unique id specifying the frame. */
  node_id: string;
  /** @see Vector */
  node_offset: Vector;
}


