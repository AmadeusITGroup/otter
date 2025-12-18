import {
  USER_ACTIVITY_MESSAGE_TYPE,
  type UserActivityMessageV1_0,
} from '@ama-mfe/messages';
import type {
  RoutedMessage,
} from '@amadeus-it-group/microfrontends';
import {
  inject,
  Injectable,
  signal,
} from '@angular/core';
import {
  type BasicMessageConsumer,
  ConsumerManagerService,
} from '../managers';
import {
  ActivityInfo,
} from './interfaces';

/**
 * Generic service that consumes user activity messages.
 * Can be used in both shell (to receive from modules) and modules (to receive from shell).
 */
@Injectable({
  providedIn: 'root'
})
export class ActivityConsumerService implements BasicMessageConsumer<UserActivityMessageV1_0> {
  private readonly consumerManagerService = inject(ConsumerManagerService);

  /**
   * Signal containing the latest activity info
   */
  private readonly latestReceivedActivityWritable = signal<ActivityInfo | undefined>(undefined);

  /**
   * Read-only signal containing the latest activity info received from other peers via the message protocol.
   * Access the timestamp via latestReceivedActivity()?.timestamp
   */
  public readonly latestReceivedActivity = this.latestReceivedActivityWritable.asReadonly();

  /**
   * @inheritdoc
   */
  public readonly type = USER_ACTIVITY_MESSAGE_TYPE;

  /**
   * @inheritdoc
   */
  public readonly supportedVersions: Record<string, (message: RoutedMessage<UserActivityMessageV1_0>) => void> = {
    // eslint-disable-next-line @typescript-eslint/naming-convention -- Version keys follow message versioning convention
    '1.0': (message) => {
      this.latestReceivedActivityWritable.set({
        channelId: message.from || 'unknown',
        eventType: message.payload.eventType,
        timestamp: message.payload.timestamp
      });
    }
  };

  /**
   * Starts the activity consumer service by registering it with the consumer manager.
   */
  public start(): void {
    this.consumerManagerService.register(this);
  }

  /**
   * Stops the activity consumer service by unregistering it from the consumer manager.
   */
  public stop(): void {
    this.consumerManagerService.unregister(this);
  }
}
