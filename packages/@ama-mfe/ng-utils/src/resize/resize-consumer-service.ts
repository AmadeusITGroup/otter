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
  Injectable,
  signal,
} from '@angular/core';
import {
  AbstractMessageConsumer,
} from '../managers/index';

/**
 * This service listens for resize messages and updates the height of elements based on the received messages.
 */
@Injectable({
  providedIn: 'root'
})
export class ResizeConsumerService extends AbstractMessageConsumer<ResizeMessage> {
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

  constructor() {
    super();
  }
}
