/**
 * Model: GetStyle200Response
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { PublishedStyle } from '../published-style';

export interface GetStyle200Response {
  /** The status of the request. */
  status: StatusEnum;
  /** For successful requests, this value is always `false`. */
  error: boolean;
  /** @see PublishedStyle */
  meta: PublishedStyle;
}

export type StatusEnum = '200';

