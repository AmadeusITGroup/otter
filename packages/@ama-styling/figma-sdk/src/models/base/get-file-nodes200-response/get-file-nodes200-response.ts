/**
 * Model: GetFileNodes200Response
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { GetFileNodes200ResponseNodesValue } from '../get-file-nodes200-response-nodes-value';

export interface GetFileNodes200Response {
  /** The name of the file as it appears in the editor. */
  name: string;
  /** The role of the user making the API request in relation to the file. */
  role: RoleEnum;
  /** The UTC ISO 8601 time at which the file was last modified. */
  lastModified: string;
  /** The type of editor associated with this file. */
  editorType: EditorTypeEnum;
  /** A URL to a thumbnail image of the file. */
  thumbnailUrl: string;
  /** The version number of the file. This number is incremented when a file is modified and can be used to check if the file has changed between requests. */
  version: string;
  /** A mapping from node IDs to node metadata. */
  nodes: { [key: string]: GetFileNodes200ResponseNodesValue; };
}

export type RoleEnum = 'owner' | 'editor' | 'viewer';
export type EditorTypeEnum = 'figma' | 'figjam';

