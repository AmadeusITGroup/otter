/**
 * Model: WebhookV2Status
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * An enum representing the possible statuses you can set a webhook to: - `ACTIVE`: The webhook is healthy and receive all events - `PAUSED`: The webhook is paused and will not receive any events
 */
/** Array of WebhookV2Status items */
export const LIST_WEBHOOK_V2_STATUS = ['ACTIVE', 'PAUSED'] as const;

/** List of available values for WebhookV2Status */
export type WebhookV2Status = 'ACTIVE' | 'PAUSED';
