/**
 * Model: Comment
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { CommentClientMeta } from '../comment-client-meta';
import { Reaction } from '../reaction';
import { User } from '../user';

/**
 * A comment or reply left by a user.
 */
export interface Comment {
  /** Unique identifier for comment. */
  id: string;
  /** @see CommentClientMeta */
  client_meta: CommentClientMeta;
  /** The file in which the comment lives */
  file_key: string;
  /** If present, the id of the comment to which this is the reply */
  parent_id?: string;
  /** @see User */
  user: User;
  /** The UTC ISO 8601 time at which the comment was left */
  created_at: string;
  /** If set, the UTC ISO 8601 time the comment was resolved */
  resolved_at?: string;
  /** The content of the comment */
  message: string;
  /** Only set for top level comments. The number displayed with the comment in the UI */
  order_id: string;
  /** An array of reactions to the comment */
  reactions: Reaction[];
}


