/**
 * Model: GetTeamComponentSets200Response
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { GetTeamComponentSets200ResponseMeta } from '../get-team-component-sets200-response-meta';

export interface GetTeamComponentSets200Response {
  /** The status of the request. */
  status: StatusEnum;
  /** For successful requests, this value is always `false`. */
  error: boolean;
  /** @see GetTeamComponentSets200ResponseMeta */
  meta: GetTeamComponentSets200ResponseMeta;
}

export type StatusEnum = '200';

