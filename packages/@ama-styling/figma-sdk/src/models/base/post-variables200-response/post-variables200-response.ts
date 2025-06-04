/**
 * Model: PostVariables200Response
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { PostVariables200ResponseMeta } from '../post-variables200-response-meta';

export interface PostVariables200Response {
  /** The response status code. */
  status: StatusEnum;
  /** For successful requests, this value is always `false`. */
  error: boolean;
  /** @see PostVariables200ResponseMeta */
  meta: PostVariables200ResponseMeta;
}

export type StatusEnum = '200';

