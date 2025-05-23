/**
 * Model: PublishedComponent
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { FrameInfo } from '../frame-info';
import { User } from '../user';

/**
 * An arrangement of published UI elements that can be instantiated across figma files.
 */
export interface PublishedComponent {
  /** The unique identifier for the component. */
  key: string;
  /** The unique identifier of the Figma file that contains the component. */
  file_key: string;
  /** The unique identifier of the component node within the Figma file. */
  node_id: string;
  /** A URL to a thumbnail image of the component. */
  thumbnail_url?: string;
  /** The name of the component. */
  name: string;
  /** The description of the component as entered by the publisher. */
  description: string;
  /** The UTC ISO 8601 time when the component was created. */
  created_at: string;
  /** The UTC ISO 8601 time when the component was last updated. */
  updated_at: string;
  /** @see User */
  user: User;
  /** @see FrameInfo */
  containing_frame?: FrameInfo;
}


