/**
 * Model: Hyperlink
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * A link to either a URL or another frame (node) in the document.
 */
export interface Hyperlink {
  /** The type of hyperlink. Can be either `URL` or `NODE`. */
  type: TypeEnum;
  /** The URL that the hyperlink points to, if `type` is `URL`. */
  url?: string;
  /** The ID of the node that the hyperlink points to, if `type` is `NODE`. */
  nodeID?: string;
}

export type TypeEnum = 'URL' | 'NODE';

