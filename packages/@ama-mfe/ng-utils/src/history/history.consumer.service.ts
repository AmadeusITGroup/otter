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
  DestroyRef,
  inject,
  Injectable,
} from '@angular/core';
import {
  ConsumerManagerService,
  type MessageConsumer,
} from '../managers/index';

/**
 * A service that handles history messages.
 *
 * This service listens for history messages and navigates accordingly.
 */
@Injectable({
  providedIn: 'root'
})
export class HistoryConsumerService implements MessageConsumer<HistoryMessage> {
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

  private readonly consumerManagerService = inject(ConsumerManagerService);

  constructor() {
    this.start();
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  /**
   * @inheritdoc
   */
  public start() {
    this.consumerManagerService.register(this);
  }

  /**
   * @inheritdoc
   */
  public stop() {
    this.consumerManagerService.unregister(this);
  }
}
