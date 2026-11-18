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

/** Array of StatusEnum items */
export const LIST_STATUS_ENUM = ['200'] as const;

/** List of available values for StatusEnum */
export type StatusEnum = '200';

