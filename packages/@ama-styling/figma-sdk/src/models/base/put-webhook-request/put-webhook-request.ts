/**
 * Model: PutWebhookRequest
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { WebhookV2Event } from '../webhook-v2-event';
import { WebhookV2Status } from '../webhook-v2-status';

export interface PutWebhookRequest {
  /** @see WebhookV2Event */
  event_type: WebhookV2Event;
  /** The HTTP endpoint that will receive a POST request when the event triggers. Max length 2048 characters. */
  endpoint: string;
  /** String that will be passed back to your webhook endpoint to verify that it is being called by Figma. Max length 100 characters. */
  passcode: string;
  /** @see WebhookV2Status */
  status?: WebhookV2Status;
  /** User provided description or name for the webhook. Max length 150 characters. */
  description?: string;
}


