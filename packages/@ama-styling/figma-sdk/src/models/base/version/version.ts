/**
 * Model: Version
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { User } from '../user';

/**
 * A version of a file
 */
export interface Version {
  /** Unique identifier for version */
  id: string;
  /** The UTC ISO 8601 time at which the version was created */
  created_at: string;
  /** The label given to the version in the editor */
  label: string;
  /** The description of the version as entered in the editor */
  description: string;
  /** @see User */
  user: User;
  /** A URL to a thumbnail image of the file version. */
  thumbnail_url?: string;
}


