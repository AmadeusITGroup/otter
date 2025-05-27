/**
 * Model: GetFileComponents200Response
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { GetFileComponents200ResponseMeta } from '../get-file-components200-response-meta';

export interface GetFileComponents200Response {
  /** The status of the request. */
  status: StatusEnum;
  /** For successful requests, this value is always `false`. */
  error: boolean;
  /** @see GetFileComponents200ResponseMeta */
  meta: GetFileComponents200ResponseMeta;
}

export type StatusEnum = '200';

