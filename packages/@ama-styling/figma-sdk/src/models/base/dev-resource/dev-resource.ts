/**
 * Model: DevResource
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * A dev resource in a file
 */
export interface DevResource {
  /** Unique identifier of the dev resource */
  id: string;
  /** The name of the dev resource. */
  name: string;
  /** The URL of the dev resource. */
  url: string;
  /** The file key where the dev resource belongs. */
  file_key: string;
  /** The target node to attach the dev resource to. */
  node_id: string;
}


