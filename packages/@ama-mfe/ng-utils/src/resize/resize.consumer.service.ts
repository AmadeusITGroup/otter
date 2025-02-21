import type {
  Resize,
  ResizeVersions,
} from '@ama-mfe/messages';
import {
  MESSAGE_RESIZE_TYPE,
} from '@ama-mfe/messages';
import type {
  RoutedMessage,
} from '@amadeus-it-group/microfrontends';
import {
  DestroyRef,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import {
  ConsumerManagerService,
  MessageConsumer,
} from '../managers/index';

/**
 * This service listens for resize messages and updates the height of elements based on the received messages.
 */
@Injectable({
  providedIn: 'root'
})
export class ResizeConsumerService implements MessageConsumer<ResizeVersions> {
  private readonly newHeight = signal<{ height: number; channelId: string } | undefined>(undefined);

  /**
   * A readonly signal that provides the new height information from the channel.
   */
  public readonly newHeightFromChannel = this.newHeight.asReadonly();

  /**
   * The type of messages this service handles ('resize').
   */
  public readonly type = MESSAGE_RESIZE_TYPE;

  /**
   * The supported versions of resize messages and their handlers.
   */
  public supportedVersions = {
    /**
     * Use the message paylod to compute a new height and emit it via the public signal
     * @param message message to consume
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention -- version as property name
    '1.0': (message: RoutedMessage<Resize>) => this.newHeight.set({ height: message.payload.height, channelId: message.from })
  };

  private readonly consumerManagerService = inject(ConsumerManagerService);

  constructor() {
    this.start();
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  /**
   * Starts the resize handler service by registering it into the consumer manager service.
   */
  public start() {
    this.consumerManagerService.register(this);
  }

  /**
   * Stops the resize handler service by unregistering it from the consumer manager service.
   */
  public stop() {
    this.consumerManagerService.unregister(this);
  }
}
