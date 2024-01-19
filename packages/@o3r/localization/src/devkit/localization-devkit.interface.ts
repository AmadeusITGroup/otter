import type {
  ConnectContentMessage,
  ContextualizationDevtoolsCommonOptions,
  DevtoolsCommonOptions,
  MessageDataTypes,
  OtterMessageContent,
  RequestMessagesContentMessage
} from '@o3r/core';
import { Subscription } from 'rxjs';

export interface LocalizationDevtoolsServiceOptions extends DevtoolsCommonOptions, ContextualizationDevtoolsCommonOptions {
}

/** Display localization key message content */
export interface DisplayLocalizationKeysContentMessage extends OtterMessageContent<'displayLocalizationKeys'> {
  /** Toggle the display of the localization keys */
  toggle?: boolean;
}

type LocalizationMessageContents =
  | DisplayLocalizationKeysContentMessage;

/** List of possible DataTypes for Localization messages */
type LocalizationMessageDataTypes = MessageDataTypes<LocalizationMessageContents>;

/** List of all messages for Localization purpose */
export type AvailableLocalizationMessageContents =
  | LocalizationMessageContents
  | ConnectContentMessage
  | RequestMessagesContentMessage<LocalizationMessageDataTypes>;


/**
 * Contextualization devtools exposed for localization in CMS integration
 */
export interface LocalizationContextualizationDevtools {
  /**
   * Show localization keys
   * @param value value enforced by the DevTools extension
   */
  showLocalizationKeys: (value?: boolean) => void | Promise<void>;

  /**
   * Returns the current language
   */
  getCurrentLanguage: () => string | Promise<string>;

  /**
   * Switch the current language to the specified value
   * @param language new language to switch to
   */
  switchLanguage: (language: string) => Promise<{ previous: string; requested: string; current: string }>;

  /**
   * Setup a listener on language change
   * @param fn called when the language is changed in the app
   */
  onLanguageChange: (fn: (language: string) => any) => Subscription;

  /**
   * Updates the specified localization key/values for the current language
   * @param keyValues key/values to update
   * @param language if not provided, the current language value
   */
  updateLocalizationKeys: (keyValues: { [key: string]: string }, language?: string) => void | Promise<void>;

  /**
   * Reload a language from the language file
   * @see https://github.com/ngx-translate/core/blob/master/packages/core/lib/translate.service.ts#L490
   * @param language language to reload
   */
  reloadLocalizationKeys: (language?: string) => Promise<void>;
}
