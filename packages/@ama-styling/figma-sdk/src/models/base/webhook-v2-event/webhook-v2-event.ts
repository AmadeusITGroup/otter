/**
 * Model: WebhookV2Event
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * An enum representing the possible events that a webhook can subscribe to
 */
/** Array of WebhookV2Event items */
export const LIST_WEBHOOK_V2_EVENT = ['PING', 'FILE_UPDATE', 'FILE_VERSION_UPDATE', 'FILE_DELETE', 'LIBRARY_PUBLISH', 'FILE_COMMENT'] as const;

/** List of available values for WebhookV2Event */
export type WebhookV2Event = 'PING' | 'FILE_UPDATE' | 'FILE_VERSION_UPDATE' | 'FILE_DELETE' | 'LIBRARY_PUBLISH' | 'FILE_COMMENT';
