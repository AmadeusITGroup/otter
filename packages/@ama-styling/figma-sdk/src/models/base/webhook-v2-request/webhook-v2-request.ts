/**
 * Model: WebhookV2Request
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { WebhookV2RequestInfo } from '../webhook-v2-request-info';
import { WebhookV2ResponseInfo } from '../webhook-v2-response-info';

/**
 * Information regarding the most recent interactions sent to a webhook endpoint
 */
export interface WebhookV2Request {
  /** The ID of the webhook the requests were sent to */
  webhook_id: string;
  /** @see WebhookV2RequestInfo */
  request_info: WebhookV2RequestInfo;
  /** @see WebhookV2ResponseInfo */
  response_info: WebhookV2ResponseInfo;
  /** Error message for this request. NULL if no error occurred */
  error_msg: string;
}


