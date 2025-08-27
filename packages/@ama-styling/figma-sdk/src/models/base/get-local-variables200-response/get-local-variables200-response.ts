/**
 * Model: GetLocalVariables200Response
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { GetLocalVariables200ResponseMeta } from '../get-local-variables200-response-meta';

export interface GetLocalVariables200Response {
  /** The response status code. */
  status: StatusEnum;
  /** For successful requests, this value is always `false`. */
  error: boolean;
  /** @see GetLocalVariables200ResponseMeta */
  meta: GetLocalVariables200ResponseMeta;
}

export type StatusEnum = '200';

