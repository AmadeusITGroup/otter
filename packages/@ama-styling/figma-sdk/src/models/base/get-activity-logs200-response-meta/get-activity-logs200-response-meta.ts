/**
 * Model: GetActivityLogs200ResponseMeta
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { ActivityLog } from '../activity-log';

export interface GetActivityLogs200ResponseMeta {
  /** An array of activity logs sorted by timestamp in ascending order by default. */
  activity_logs?: ActivityLog[];
  /** Encodes the last event (the most recent event) */
  cursor?: string;
  /** Whether there is a next page of events */
  next_page?: boolean;
}


