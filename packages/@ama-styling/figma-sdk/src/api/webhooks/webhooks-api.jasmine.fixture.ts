import { WebhooksApi } from './webhooks-api';

export class WebhooksApiFixture implements Partial<Readonly<WebhooksApi>> {

  /** @inheritDoc */
  public readonly apiName = 'WebhooksApi';

    /**
   * Fixture associated to function deleteWebhook
   */
  public deleteWebhook: jasmine.Spy = jasmine.createSpy('deleteWebhook');
  /**
   * Fixture associated to function getTeamWebhooks
   */
  public getTeamWebhooks: jasmine.Spy = jasmine.createSpy('getTeamWebhooks');
  /**
   * Fixture associated to function getWebhook
   */
  public getWebhook: jasmine.Spy = jasmine.createSpy('getWebhook');
  /**
   * Fixture associated to function getWebhookRequests
   */
  public getWebhookRequests: jasmine.Spy = jasmine.createSpy('getWebhookRequests');
  /**
   * Fixture associated to function postWebhook
   */
  public postWebhook: jasmine.Spy = jasmine.createSpy('postWebhook');
  /**
   * Fixture associated to function putWebhook
   */
  public putWebhook: jasmine.Spy = jasmine.createSpy('putWebhook');
}
