/**
 * Model: GetComponentSet200Response
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { PublishedComponentSet } from '../published-component-set';

export interface GetComponentSet200Response {
  /** The status of the request. */
  status: StatusEnum;
  /** For successful requests, this value is always `false`. */
  error: boolean;
  /** @see PublishedComponentSet */
  meta: PublishedComponentSet;
}

/** Array of StatusEnum items */
export const LIST_STATUS_ENUM = ['200'] as const;

/** List of available values for StatusEnum */
export type StatusEnum = '200';

