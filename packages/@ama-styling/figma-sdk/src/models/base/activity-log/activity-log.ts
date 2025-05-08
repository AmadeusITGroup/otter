/**
 * Model: ActivityLog
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { ActivityLogAction } from '../activity-log-action';
import { ActivityLogActor } from '../activity-log-actor';
import { ActivityLogContext } from '../activity-log-context';
import { ActivityLogEntity } from '../activity-log-entity';

/**
 * An event returned by the Activity Logs API.
 */
export interface ActivityLog {
  /** The ID of the event. */
  id: string;
  /** The timestamp of the event in seconds since the Unix epoch. */
  timestamp: number;
  /** @see ActivityLogActor */
  actor: ActivityLogActor;
  /** @see ActivityLogAction */
  action: ActivityLogAction;
  /** @see ActivityLogEntity */
  entity: ActivityLogEntity;
  /** @see ActivityLogContext */
  context: ActivityLogContext;
}


