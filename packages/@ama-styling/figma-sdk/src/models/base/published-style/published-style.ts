/**
 * Model: PublishedStyle
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { StyleType } from '../style-type';
import { User } from '../user';

/**
 * A set of published properties that can be applied to nodes.
 */
export interface PublishedStyle {
  /** The unique identifier for the style */
  key: string;
  /** The unique identifier of the Figma file that contains the style. */
  file_key: string;
  /** ID of the style node within the figma file */
  node_id: string;
  /** @see StyleType */
  style_type: StyleType;
  /** A URL to a thumbnail image of the style. */
  thumbnail_url?: string;
  /** The name of the style. */
  name: string;
  /** The description of the style as entered by the publisher. */
  description: string;
  /** The UTC ISO 8601 time when the style was created. */
  created_at: string;
  /** The UTC ISO 8601 time when the style was last updated. */
  updated_at: string;
  /** @see User */
  user: User;
  /** A user specified order number by which the style can be sorted. */
  sort_position: string;
}


