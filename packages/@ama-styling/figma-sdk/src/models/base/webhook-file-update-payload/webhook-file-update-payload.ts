/**
 * Model: WebhookFileUpdatePayload
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



export interface WebhookFileUpdatePayload {
  /** The passcode specified when the webhook was created, should match what was initially provided */
  passcode: string;
  /** UTC ISO 8601 timestamp of when the event was triggered. */
  timestamp: string;
  /** The id of the webhook that caused the callback */
  webhook_id: string;
  /** @see EventTypeEnum */
  event_type: EventTypeEnum;
  /** The key of the file that was updated */
  file_key: string;
  /** The name of the file that was updated */
  file_name: string;
}

export type EventTypeEnum = 'FILE_UPDATE';

