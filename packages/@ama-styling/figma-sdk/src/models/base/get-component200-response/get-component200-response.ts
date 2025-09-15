/**
 * Model: GetComponent200Response
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { PublishedComponent } from '../published-component';

export interface GetComponent200Response {
  /** The status of the request. */
  status: StatusEnum;
  /** For successful requests, this value is always `false`. */
  error: boolean;
  /** @see PublishedComponent */
  meta: PublishedComponent;
}

export type StatusEnum = '200';

