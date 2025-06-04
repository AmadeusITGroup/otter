import { GetTeamWebhooks200Response } from '../../models/base/get-team-webhooks200-response/index';
import { GetWebhookRequests200Response } from '../../models/base/get-webhook-requests200-response/index';
import { WebhookV2 } from '../../models/base/webhook-v2/index';

import { WebhooksApi, WebhooksApiDeleteWebhookRequestData, WebhooksApiGetTeamWebhooksRequestData, WebhooksApiGetWebhookRequestData, WebhooksApiGetWebhookRequestsRequestData, WebhooksApiPostWebhookRequestData, WebhooksApiPutWebhookRequestData } from './webhooks-api';

export class WebhooksApiFixture implements Partial<Readonly<WebhooksApi>> {

  /** @inheritDoc */
  public readonly apiName = 'WebhooksApi';

    /**
   * Fixture associated to function deleteWebhook
   */
  public deleteWebhook: jest.Mock<Promise<WebhookV2>, [WebhooksApiDeleteWebhookRequestData]> = jest.fn();
  /**
   * Fixture associated to function getTeamWebhooks
   */
  public getTeamWebhooks: jest.Mock<Promise<GetTeamWebhooks200Response>, [WebhooksApiGetTeamWebhooksRequestData]> = jest.fn();
  /**
   * Fixture associated to function getWebhook
   */
  public getWebhook: jest.Mock<Promise<WebhookV2>, [WebhooksApiGetWebhookRequestData]> = jest.fn();
  /**
   * Fixture associated to function getWebhookRequests
   */
  public getWebhookRequests: jest.Mock<Promise<GetWebhookRequests200Response>, [WebhooksApiGetWebhookRequestsRequestData]> = jest.fn();
  /**
   * Fixture associated to function postWebhook
   */
  public postWebhook: jest.Mock<Promise<WebhookV2>, [WebhooksApiPostWebhookRequestData]> = jest.fn();
  /**
   * Fixture associated to function putWebhook
   */
  public putWebhook: jest.Mock<Promise<WebhookV2>, [WebhooksApiPutWebhookRequestData]> = jest.fn();
}

