/**
 * Model: WebhookV2RequestInfo
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * Information regarding the request sent to a webhook endpoint
 */
export interface WebhookV2RequestInfo {
  /** The ID of the webhook */
  id: string;
  /** The actual endpoint the request was sent to */
  endpoint: string;
  /** The contents of the request that was sent to the endpoint */
  payload: any;
  /** UTC ISO 8601 timestamp of when the request was sent */
  sent_at: string;
}


