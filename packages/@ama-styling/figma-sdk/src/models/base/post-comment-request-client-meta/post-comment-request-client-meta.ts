/**
 * Model: PostCommentRequestClientMeta
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { FrameOffset } from '../frame-offset';
import { FrameOffsetRegion } from '../frame-offset-region';
import { Region } from '../region';
import { Vector } from '../vector';

/**
 * The position where to place the comment.
 */
export type PostCommentRequestClientMeta = FrameOffset | FrameOffsetRegion | Region | Vector;

/** Array of CommentPinCornerEnum items */
export const LIST_COMMENT_PIN_CORNER_ENUM = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;

/** List of available values for CommentPinCornerEnum */
export type CommentPinCornerEnum = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

