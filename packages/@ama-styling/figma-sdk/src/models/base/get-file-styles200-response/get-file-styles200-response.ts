/**
 * Model: GetFileStyles200Response
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { GetFileStyles200ResponseMeta } from '../get-file-styles200-response-meta';

export interface GetFileStyles200Response {
  /** The status of the request. */
  status: StatusEnum;
  /** For successful requests, this value is always `false`. */
  error: boolean;
  /** @see GetFileStyles200ResponseMeta */
  meta: GetFileStyles200ResponseMeta;
}

export type StatusEnum = '200';

