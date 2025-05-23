/**
 * Model: CommentClientMeta
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { FrameOffset } from '../frame-offset';
import { FrameOffsetRegion } from '../frame-offset-region';
import { Region } from '../region';
import { Vector } from '../vector';

/**
 * Positioning information of the comment. Includes information on the location of the comment pin, which is either the absolute coordinates on the canvas or a relative offset within a frame. If the comment is a region, it will also contain the region height, width, and position of the anchor in regards to the region.
 */
export type CommentClientMeta = FrameOffset | FrameOffsetRegion | Region | Vector;

export type CommentPinCornerEnum = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

