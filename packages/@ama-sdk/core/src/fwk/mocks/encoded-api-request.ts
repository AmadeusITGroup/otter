import {
  RequestBody
} from '../../plugins/index';

/**
 * Defines an API request encoded
 */
export interface EncodedApiRequest {
  /** The query parameters used */
  queryParams?: {
    [key: string]: string;
  };
  /** The body used. */
  body?: RequestBody;
  /** The HTTP method used (e.g GET, POST, etc..) */
  method: string;
  /** The base path of the request */
  basePath: string;
}
