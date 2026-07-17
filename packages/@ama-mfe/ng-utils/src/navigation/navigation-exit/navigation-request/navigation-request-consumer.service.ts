import {
  NAVIGATION_REQUEST_MESSAGE_TYPE,
  type NavigationRequestMessage,
  type NavigationRequestV1_0,
} from '@ama-mfe/messages';
import type {
  RoutedMessage,
} from '@amadeus-it-group/microfrontends';
import {
  inject,
  Injectable,
} from '@angular/core';
import {
  AbstractMessageConsumer,
} from '../../../managers';
import {
  NAVIGATION_REQUEST_HANDLER,
} from './navigation-request-handler';
import {
  NavigationRequestManagerService,
} from './navigation-request-manager.service';

/**
 * Agnostic consumer for `navigation-request` messages.
 *
 * On each incoming request, invokes the side-specific handler registered under {@link NAVIGATION_REQUEST_HANDLER}:
 * - **Cockpit side** — handler opens the confirmation modal and awaits the user's answer. If the user cancels the handler
 *   throws; this consumer catches it and replies with a decision carrying `proceed: false`, so the module's pending promise
 *   resolves to `false` and the in-iframe navigation is held until a fresh request is made.
 * - **Module side** — handler runs the unblock / future draft-persistence logic and resolves. Modules cannot refuse;
 *   a decision is always sent.
 */
@Injectable({
  providedIn: 'root'
})
export class NavigationRequestConsumerService extends AbstractMessageConsumer<NavigationRequestMessage> {
  /**
   * @inheritdoc
   */
  public readonly type = NAVIGATION_REQUEST_MESSAGE_TYPE;

  /**
   * @inheritdoc
   */
  public readonly supportedVersions = {
    // eslint-disable-next-line @typescript-eslint/naming-convention -- expected naming for versions
    '1.0': (message: RoutedMessage<NavigationRequestV1_0>) => this.handleRequest(message)
  };

  private readonly producerService = inject(NavigationRequestManagerService);
  private readonly handler = inject(NAVIGATION_REQUEST_HANDLER);

  private async handleRequest(message: RoutedMessage<NavigationRequestV1_0>): Promise<void> {
    try {
      await this.handler.handle({ from: message.from, reason: message.payload.reason });
    } catch (error) {
      // Handler rejected — usually the user cancelled, but any unexpected
      // exception ends up here too. Log it so the failure is observable, then
      // send a decision with proceed=false so the requester's pending promise
      // resolves and subsequent navigation attempts can create a fresh request.
      this.logger.error('navigation-request handler rejected', error, message);
      this.producerService.sendDecision(message.payload.correlationId, message.from, false);
      return;
    }
    this.producerService.sendDecision(message.payload.correlationId, message.from);
  }
}
