import type {
  HistoryMessage,
  HistoryV1_0,
} from '@ama-mfe/messages';
import {
  HISTORY_MESSAGE_TYPE,
} from '@ama-mfe/messages';
import type {
  RoutedMessage,
} from '@amadeus-it-group/microfrontends';
import {
  Injectable,
} from '@angular/core';
import {
  AbstractMessageConsumer,
} from '../managers/index';

/**
 * A service that handles history messages.
 *
 * This service listens for history messages and navigates accordingly.
 */
@Injectable({
  providedIn: 'root'
})
export class HistoryConsumerService extends AbstractMessageConsumer<HistoryMessage> {
  /**
   * The type of messages this service handles.
   */
  public readonly type = HISTORY_MESSAGE_TYPE;

  /**
   * @inheritdoc
   */
  public readonly supportedVersions = {
    /**
     * Use the message payload to navigate in the history
     * @param message message to consume
     */
    '1.0': (message: RoutedMessage<HistoryV1_0>) => {
      history.go(message.payload.delta);
    }
  };

  constructor() {
    super();
    /**
     * Auto-starts the consumer on creation.
     * @deprecated The constructor auto-starts the consumer for backwards compatibility. It will be removed in v15;
     */
    this.start();
  }
}
