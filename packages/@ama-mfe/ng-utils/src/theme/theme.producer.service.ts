import type {
  ThemeMessage,
  ThemeV1_0,
} from '@ama-mfe/messages';
import {
  THEME_MESSAGE_TYPE,
  ThemeStructure,
} from '@ama-mfe/messages';
import {
  MessagePeerService,
} from '@amadeus-it-group/microfrontends-angular';
import {
  effect,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import {
  LoggerService,
} from '@o3r/logger';
import {
  type MessageProducer,
  registerProducer,
} from '../managers/index';
import {
  type ErrorContent,
} from '../messages/index';
import {
  applyTheme,
  getStyle,
  THEME_QUERY_PARAM_NAME,
  THEME_URL_SUFFIX,
} from './theme.helpers';
/**
 * This service exposing the current theme signal
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeProducerService implements MessageProducer<ThemeMessage> {
  private readonly messageService = inject(MessagePeerService<ThemeMessage>);
  private readonly logger = inject(LoggerService);
  private previousTheme: ThemeStructure | undefined;

  private readonly currentThemeSelection;
  /** Current selected theme signal */
  public readonly currentTheme;

  /**
   * The type of messages this service handles ('theme').
   */
  public readonly types = THEME_MESSAGE_TYPE;

  constructor() {
    registerProducer(this);

    // get the current theme name from the url (if any) and emit a first value for the current theme
    const parentUrl = new URL(window.location.toString());
    const selectedThemeName = parentUrl.searchParams.get(THEME_QUERY_PARAM_NAME);
    this.currentThemeSelection = signal<ThemeStructure | undefined>(selectedThemeName
      ? {
        name: selectedThemeName,
        css: null
      }
      : undefined);
    this.currentTheme = this.currentThemeSelection.asReadonly();

    if (selectedThemeName) {
      void this.changeTheme(selectedThemeName);
    }

    // When the current theme changes, apply it to the current application
    effect(() => {
      const themeObj = this.currentTheme();
      if (themeObj?.css !== null) {
        applyTheme(themeObj?.css);
      }
    });

    /**
     * This effect listens for changes in the `currentTheme` signal. If a valid theme object with CSS is present,
     * it creates a theme message and sends it via the message service.
     */
    effect(() => {
      const themeObj = this.currentTheme();
      if (themeObj && themeObj.css !== null) {
        const messageV10 = {
          type: 'theme',
          name: themeObj.name,
          css: themeObj.css,
          version: '1.0'
        } satisfies ThemeV1_0;
        // TODO: sendBest() is not yet implemented -- https://github.com/AmadeusITGroup/microfrontends/issues/11
        this.messageService.send(messageV10);
      }
    });
  }

  /**
   * Changes the current theme to the specified theme name.
   * @param themeName - The name of the theme to change to.
   */
  public async changeTheme(themeName?: string): Promise<void> {
    const cssHref = themeName && `${themeName}${THEME_URL_SUFFIX}`;
    const styleObj = cssHref ? await getStyle(cssHref) : '';
    this.currentThemeSelection.update((theme) => {
      this.previousTheme = theme;
      return themeName
        ? { name: themeName, css: styleObj }
        : undefined;
    });
  }

  /**
   * Reverts to the previous theme.
   */
  public revertToPreviousTheme(): void {
    this.currentThemeSelection.set(this.previousTheme);
  }

  /**
   * @inheritdoc
   */
  public handleError(message: ErrorContent<ThemeV1_0>): void {
    this.logger.error('Error in theme service message', message);
    this.revertToPreviousTheme();
  }
}
