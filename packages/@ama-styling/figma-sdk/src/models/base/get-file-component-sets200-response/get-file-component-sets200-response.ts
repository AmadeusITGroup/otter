/**
 * Model: GetFileComponentSets200Response
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { GetFileComponentSets200ResponseMeta } from '../get-file-component-sets200-response-meta';

export interface GetFileComponentSets200Response {
  /** The status of the request. */
  status: StatusEnum;
  /** For successful requests, this value is always `false`. */
  error: boolean;
  /** @see GetFileComponentSets200ResponseMeta */
  meta: GetFileComponentSets200ResponseMeta;
}

export type StatusEnum = '200';

