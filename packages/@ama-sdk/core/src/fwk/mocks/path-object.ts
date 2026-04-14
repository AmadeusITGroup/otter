import {
  Operation,
} from './operation';

/** Describes a path on the swagger specification */
export interface PathObject {
  /** Pattern of the URL after part after the baseUrl */
  urlPattern?: string;
  /** The regular expression that defines the full path (including baseUrl) */
  regexp: RegExp;
  /** The url path */
  path: string;
  /** The list of operations linked to the url path */
  operations: Operation[];
}
