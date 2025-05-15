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

export type StatusEnum = '200';

