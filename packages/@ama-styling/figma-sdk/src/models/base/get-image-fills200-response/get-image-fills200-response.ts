/**
 * Model: GetImageFills200Response
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { GetImageFills200ResponseMeta } from '../get-image-fills200-response-meta';

export interface GetImageFills200Response {
  /** For successful requests, this value is always `false`. */
  error: boolean;
  /** Status code */
  status: StatusEnum;
  /** @see GetImageFills200ResponseMeta */
  meta: GetImageFills200ResponseMeta;
}

/** Array of StatusEnum items */
export const LIST_STATUS_ENUM = ['200'] as const;

/** List of available values for StatusEnum */
export type StatusEnum = '200';

