/**
 * Model: PublishedComponentSet
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { FrameInfo } from '../frame-info';
import { User } from '../user';

/**
 * A node containing a set of variants of a component.
 */
export interface PublishedComponentSet {
  /** The unique identifier for the component set. */
  key: string;
  /** The unique identifier of the Figma file that contains the component set. */
  file_key: string;
  /** The unique identifier of the component set node within the Figma file. */
  node_id: string;
  /** A URL to a thumbnail image of the component set. */
  thumbnail_url?: string;
  /** The name of the component set. */
  name: string;
  /** The description of the component set as entered by the publisher. */
  description: string;
  /** The UTC ISO 8601 time when the component set was created. */
  created_at: string;
  /** The UTC ISO 8601 time when the component set was last updated. */
  updated_at: string;
  /** @see User */
  user: User;
  /** @see FrameInfo */
  containing_frame?: FrameInfo;
}


