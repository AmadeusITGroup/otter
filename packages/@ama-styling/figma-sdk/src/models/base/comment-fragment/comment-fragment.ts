/**
 * Model: CommentFragment
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * An object representing a fragment of a comment left by a user, used in the payload of the `FILE_COMMENT` event. Note only ONE of the fields below will be set
 */
export interface CommentFragment {
  /** Comment text that is set if a fragment is text based */
  text?: string;
  /** User id that is set if a fragment refers to a user mention */
  mention?: string;
}


