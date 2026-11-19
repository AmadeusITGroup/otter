/**
 * Model: GetPublishedVariables200Response
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { GetPublishedVariables200ResponseMeta } from '../get-published-variables200-response-meta';

export interface GetPublishedVariables200Response {
  /** The response status code. */
  status: StatusEnum;
  /** For successful requests, this value is always `false`. */
  error: boolean;
  /** @see GetPublishedVariables200ResponseMeta */
  meta: GetPublishedVariables200ResponseMeta;
}

/** Array of StatusEnum items */
export const LIST_STATUS_ENUM = ['200'] as const;

/** List of available values for StatusEnum */
export type StatusEnum = '200';

