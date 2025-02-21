import type {
  Theme,
  ThemeVersions,
} from '@ama-mfe/messages';
import {
  MESSAGE_THEME_TYPE,
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
  MessageConsumer,
} from '../managers/index';
import {
  applyTheme,
} from './theme.helpers';

/**
 * A service that handles theme messages and applies the received theme.
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeConsumerService implements MessageConsumer<ThemeVersions> {
  /**
   * The type of messages this service handles ('theme').
   */
  public readonly type = MESSAGE_THEME_TYPE;

  /**
   * The supported versions of theme messages and their handlers.
   */
  public readonly supportedVersions = {
    /**
     * Use the message paylod to get the theme and apply it
     * @param message message to consume
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention -- version number used as object key
    '1.0': (message: RoutedMessage<Theme>) => applyTheme(message.payload.theme)
  };

  private readonly consumerManagerService = inject(ConsumerManagerService);

  constructor() {
    this.start();
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  /**
   * Starts the theme handler service by registering it into the consumer manager service.
   */
  public start() {
    this.consumerManagerService.register(this);
  }

  /**
   * Stops the theme handler service by unregistering it from the consumer manager service.
   */
  public stop() {
    this.consumerManagerService.unregister(this);
  }
}
