import {Operation} from './operation';

/** Describes a path on the swagger specification */
export interface PathObject {
  /** The regular expression that defines the path */
  regexp: RegExp;
  /** The url path */
  path: string;
  /** The list of operations linked to the url path */
  operations: Operation[];
}
