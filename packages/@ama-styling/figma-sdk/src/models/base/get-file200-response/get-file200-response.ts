/**
 * Model: GetFile200Response
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { Component } from '../component';
import { ComponentSet } from '../component-set';
import { DocumentNode } from '../document-node';
import { GetFile200ResponseBranchesInner } from '../get-file200-response-branches-inner';
import { Style } from '../style';

export interface GetFile200Response {
  /** The name of the file as it appears in the editor. */
  name: string;
  /** The role of the user making the API request in relation to the file. */
  role: RoleEnum;
  /** The UTC ISO 8601 time at which the file was last modified. */
  lastModified: string;
  /** The type of editor associated with this file. */
  editorType: EditorTypeEnum;
  /** A URL to a thumbnail image of the file. */
  thumbnailUrl?: string;
  /** The version number of the file. This number is incremented when a file is modified and can be used to check if the file has changed between requests. */
  version: string;
  /** @see DocumentNode */
  document: DocumentNode;
  /** A mapping from component IDs to component metadata. */
  components: { [key: string]: Component; };
  /** A mapping from component set IDs to component set metadata. */
  componentSets: { [key: string]: ComponentSet; };
  /** The version of the file schema that this file uses. */
  schemaVersion: number;
  /** A mapping from style IDs to style metadata. */
  styles: { [key: string]: Style; };
  /** The share permission level of the file link. */
  linkAccess?: string;
  /** The key of the main file for this file. If present, this file is a component or component set. */
  mainFileKey?: string;
  /** A list of branches for this file. */
  branches?: GetFile200ResponseBranchesInner[];
}

export type RoleEnum = 'owner' | 'editor' | 'viewer';
export type EditorTypeEnum = 'figma' | 'figjam';

