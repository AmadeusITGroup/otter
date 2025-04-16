import type {
  ThemeMessage,
  ThemeV1_0,
} from '@ama-mfe/messages';
import {
  THEME_MESSAGE_TYPE,
} from '@ama-mfe/messages';
import type {
  RoutedMessage,
} from '@amadeus-it-group/microfrontends';
import {
  DestroyRef,
  inject,
  Injectable,
  SecurityContext,
} from '@angular/core';
import {
  DomSanitizer,
} from '@angular/platform-browser';
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
export class ThemeConsumerService implements MessageConsumer<ThemeMessage> {
  private readonly domSanitizer = inject(DomSanitizer);
  private readonly consumerManagerService = inject(ConsumerManagerService);
  /**
   * The type of messages this service handles ('theme').
   */
  public readonly type = THEME_MESSAGE_TYPE;

  /**
   * The supported versions of theme messages and their handlers.
   */
  public readonly supportedVersions = {
    /**
     * Use the message paylod to get the theme and apply it
     * @param message message to consume
     */
    '1.0': (message: RoutedMessage<ThemeV1_0>) => {
      const sanitizedCss = this.domSanitizer.sanitize(SecurityContext.STYLE, message.payload.css);
      if (sanitizedCss !== null) {
        applyTheme(sanitizedCss);
      }
    }
  };

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
