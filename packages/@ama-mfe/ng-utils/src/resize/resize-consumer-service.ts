import type {
  ResizeMessage,
  ResizeV1_0,
} from '@ama-mfe/messages';
import {
  RESIZE_MESSAGE_TYPE,
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
export class ResizeConsumerService implements MessageConsumer<ResizeMessage> {
  private readonly newHeight = signal<{ height: number; channelId: string } | undefined>(undefined);

  /**
   * A readonly signal that provides the new height information from the channel.
   */
  public readonly newHeightFromChannel = this.newHeight.asReadonly();

  /**
   * The type of messages this service handles ('resize').
   */
  public readonly type = RESIZE_MESSAGE_TYPE;

  /**
   * The supported versions of resize messages and their handlers.
   */
  public supportedVersions = {
    /**
     * Use the message paylod to compute a new height and emit it via the public signal
     * @param message message to consume
     */
    '1.0': (message: RoutedMessage<ResizeV1_0>) => this.newHeight.set({ height: message.payload.height, channelId: message.from })
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
