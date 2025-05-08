/**
 * Model: PostCommentRequest
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { PostCommentRequestClientMeta } from '../post-comment-request-client-meta';

export interface PostCommentRequest {
  /** The text contents of the comment to post. */
  message: string;
  /** The ID of the comment to reply to, if any. This must be a root comment. You cannot reply to other replies (a comment that has a parent_id). */
  comment_id?: string;
  /** @see PostCommentRequestClientMeta */
  client_meta?: PostCommentRequestClientMeta;
}


