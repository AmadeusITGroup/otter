/**
 * Model: GetActivityLogs200Response
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { GetActivityLogs200ResponseMeta } from '../get-activity-logs200-response-meta';

export interface GetActivityLogs200Response {
  /** The response status code. */
  status?: StatusEnum;
  /** For successful requests, this value is always `false`. */
  error?: boolean;
  /** @see GetActivityLogs200ResponseMeta */
  meta?: GetActivityLogs200ResponseMeta;
}

/** Array of StatusEnum items */
export const LIST_STATUS_ENUM = ['200'] as const;

/** List of available values for StatusEnum */
export type StatusEnum = '200';

