import {
  NAVIGATION_DECISION_MESSAGE_TYPE,
  type NavigationDecisionMessage,
  type NavigationDecisionV1_0,
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
  NavigationRequestManagerService,
} from '../navigation-request/navigation-request-manager.service';

/**
 * Agnostic consumer for `navigation-decision` messages — the reply to a
 * previously sent `navigation-request`. Forwards the decision to
 * {@link NavigationRequestManagerService.resolvePendingRequest} so
 * the awaiting caller's promise resolves.
 */
@Injectable({
  providedIn: 'root'
})
export class NavigationDecisionConsumerService extends AbstractMessageConsumer<NavigationDecisionMessage> {
  /**
   * @inheritdoc
   */
  public readonly type = NAVIGATION_DECISION_MESSAGE_TYPE;

  /**
   * @inheritdoc
   */
  public readonly supportedVersions = {
    // eslint-disable-next-line @typescript-eslint/naming-convention -- expected naming for versions
    '1.0': (message: RoutedMessage<NavigationDecisionV1_0>) => {
      this.producerService.resolvePendingRequest(message.payload.correlationId, message.payload.proceed);
    }
  };

  private readonly producerService = inject(NavigationRequestManagerService);
}
