/**
 * Model: GetTeamStyles200Response
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { GetTeamStyles200ResponseMeta } from '../get-team-styles200-response-meta';

export interface GetTeamStyles200Response {
  /** The status of the request. */
  status: StatusEnum;
  /** For successful requests, this value is always `false`. */
  error: boolean;
  /** @see GetTeamStyles200ResponseMeta */
  meta: GetTeamStyles200ResponseMeta;
}

export type StatusEnum = '200';

