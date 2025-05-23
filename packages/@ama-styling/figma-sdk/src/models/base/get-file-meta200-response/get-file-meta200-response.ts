/**
 * Model: GetFileMeta200Response
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { User } from '../user';

export interface GetFileMeta200Response {
  /** The name of the file. */
  name: string;
  /** The name of the project containing the file. */
  folder_name?: string;
  /** The UTC ISO 8601 time at which the file content was last modified. */
  last_touched_at: string;
  /** @see User */
  creator: User;
  /** @see User */
  last_touched_by?: User;
  /** A URL to a thumbnail image of the file. */
  thumbnail_url?: string;
  /** The type of editor associated with this file. */
  editorType: EditorTypeEnum;
  /** The role of the user making the API request in relation to the file. */
  role?: RoleEnum;
  /** Access policy for users who have the link to the file. */
  link_access?: LinkAccessEnum;
  /** The URL of the file. */
  url?: string;
  /** The version number of the file. This number is incremented when a file is modified and can be used to check if the file has changed between requests. */
  version?: string;
}

export type EditorTypeEnum = 'figma' | 'figjam' | 'slides';
export type RoleEnum = 'owner' | 'editor' | 'viewer';
export type LinkAccessEnum = 'view' | 'edit' | 'org_view' | 'org_edit' | 'inherit';

