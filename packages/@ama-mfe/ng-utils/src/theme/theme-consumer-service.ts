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
  inject,
  Injectable,
  SecurityContext,
} from '@angular/core';
import {
  DomSanitizer,
} from '@angular/platform-browser';
import {
  AbstractMessageConsumer,
} from '../managers/index';
import {
  applyTheme,
  downloadApplicationThemeCss,
} from './theme-helpers';

/**
 * A service that handles theme messages and applies the received theme.
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeConsumerService extends AbstractMessageConsumer<ThemeMessage> {
  private readonly domSanitizer = inject(DomSanitizer);
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
    '1.0': async (message: RoutedMessage<ThemeV1_0>) => {
      const sanitizedCss = this.domSanitizer.sanitize(SecurityContext.STYLE, message.payload.css);
      if (sanitizedCss !== null) {
        applyTheme(sanitizedCss);
      }
      try {
        const css = await downloadApplicationThemeCss(message.payload.name, { logger: this.logger });
        applyTheme(css, false);
      } catch (e) {
        this.logger.warn(`No CSS variable for the theme ${message.payload.name}`, e);
      }
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
