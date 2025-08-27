/**
 * Model: WebhookV2
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { WebhookV2Event } from '../webhook-v2-event';
import { WebhookV2Status } from '../webhook-v2-status';

/**
 * A description of an HTTP webhook (from Figma back to your application)
 */
export interface WebhookV2 {
  /** The ID of the webhook */
  id: string;
  /** @see WebhookV2Event */
  event_type: WebhookV2Event;
  /** The team id you are subscribed to for updates */
  team_id: string;
  /** @see WebhookV2Status */
  status: WebhookV2Status;
  /** The client ID of the OAuth application that registered this webhook, if any */
  client_id: string;
  /** The passcode that will be passed back to the webhook endpoint */
  passcode: string;
  /** The endpoint that will be hit when the webhook is triggered */
  endpoint: string;
  /** Optional user-provided description or name for the webhook. This is provided to help make maintaining a number of webhooks more convenient. Max length 140 characters. */
  description: string;
}


