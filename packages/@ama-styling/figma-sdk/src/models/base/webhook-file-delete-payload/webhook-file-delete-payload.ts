/**
 * Model: WebhookFileDeletePayload
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { User } from '../user';

export interface WebhookFileDeletePayload {
  /** The passcode specified when the webhook was created, should match what was initially provided */
  passcode: string;
  /** UTC ISO 8601 timestamp of when the event was triggered. */
  timestamp: string;
  /** The id of the webhook that caused the callback */
  webhook_id: string;
  /** @see EventTypeEnum */
  event_type: EventTypeEnum;
  /** The key of the file that was deleted */
  file_key: string;
  /** The name of the file that was deleted */
  file_name: string;
  /** @see User */
  triggered_by: User;
}

/** Array of EventTypeEnum items */
export const LIST_EVENT_TYPE_ENUM = ['FILE_DELETE'] as const;

/** List of available values for EventTypeEnum */
export type EventTypeEnum = 'FILE_DELETE';

