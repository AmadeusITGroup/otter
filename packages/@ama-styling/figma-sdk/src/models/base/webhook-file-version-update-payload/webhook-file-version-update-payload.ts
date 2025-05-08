/**
 * Model: WebhookFileVersionUpdatePayload
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { User } from '../user';

export interface WebhookFileVersionUpdatePayload {
  /** The passcode specified when the webhook was created, should match what was initially provided */
  passcode: string;
  /** UTC ISO 8601 timestamp of when the event was triggered. */
  timestamp: string;
  /** The id of the webhook that caused the callback */
  webhook_id: string;
  /** @see EventTypeEnum */
  event_type: EventTypeEnum;
  /** UTC ISO 8601 timestamp of when the version was created */
  created_at: string;
  /** Description of the version in the version history */
  description?: string;
  /** The key of the file that was updated */
  file_key: string;
  /** The name of the file that was updated */
  file_name: string;
  /** @see User */
  triggered_by: User;
  /** ID of the published version */
  version_id: string;
}

export type EventTypeEnum = 'FILE_VERSION_UPDATE';

