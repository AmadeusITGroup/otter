/**
 * Model: WebhookFileCommentPayload
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { CommentFragment } from '../comment-fragment';
import { User } from '../user';

export interface WebhookFileCommentPayload {
  /** The passcode specified when the webhook was created, should match what was initially provided */
  passcode: string;
  /** UTC ISO 8601 timestamp of when the event was triggered. */
  timestamp: string;
  /** The id of the webhook that caused the callback */
  webhook_id: string;
  /** @see EventTypeEnum */
  event_type: EventTypeEnum;
  /** Contents of the comment itself */
  comment: CommentFragment[];
  /** Unique identifier for comment */
  comment_id: string;
  /** The UTC ISO 8601 time at which the comment was left */
  created_at: string;
  /** The key of the file that was commented on */
  file_key: string;
  /** The name of the file that was commented on */
  file_name: string;
  /** Users that were mentioned in the comment */
  mentions?: User[];
  /** @see User */
  triggered_by: User;
}

export type EventTypeEnum = 'FILE_COMMENT';

