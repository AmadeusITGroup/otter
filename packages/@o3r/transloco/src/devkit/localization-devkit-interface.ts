import type {
  ConnectContentMessage,
  ContextualizationDevtoolsCommonOptions,
  DevtoolsCommonOptions,
  MessageDataTypes,
  OtterMessageContent,
  RequestMessagesContentMessage,
} from '@o3r/core';
import type {
  LocalizationMetadata,
} from '../core';

/**
 * Configuration options for the Localization Devtools service
 */
export interface LocalizationDevtoolsServiceOptions extends DevtoolsCommonOptions, ContextualizationDevtoolsCommonOptions {
  /** Path to the localization metadata file */
  metadataFilePath: string;
}

/** Localizations message content */
export interface LocalizationsContentMessage extends OtterMessageContent<'localizations'> {
  /** Localizations metadata */
  localizations: LocalizationMetadata;
}

/** Languages message content */
export interface LanguagesContentMessage extends OtterMessageContent<'languages'> {
  /** Languages available */
  languages: string[];
}

/** Switch languages message content */
export interface SwitchLanguageContentMessage extends OtterMessageContent<'switchLanguage'> {
  /** Language */
  language: string;
}

/** Display localization key message content */
export interface DisplayLocalizationKeysContentMessage extends OtterMessageContent<'displayLocalizationKeys'> {
  /** Toggle the display of the localization keys */
  toggle?: boolean;
}

/** Update localization message content */
export interface UpdateLocalizationContentMessage extends OtterMessageContent<'updateLocalization'> {
  /** Localization key */
  key: string;
  /** Localization value */
  value: string;
  /** Lang */
  lang?: string;
}

/** Reload localization Keys message content */
export interface ReloadLocalizationKeysContentMessage extends OtterMessageContent<'reloadLocalizationKeys'> {
  /** Lang */
  lang?: string;
}

/** Is translation deactivation enabled message content */
export interface IsTranslationDeactivationEnabledContentMessage extends OtterMessageContent<'isTranslationDeactivationEnabled'> {
  /** Whether translation deactivation is enabled */
  enabled: boolean;
}

/** Get translation values message content */
export interface GetTranslationValuesContentMessage extends OtterMessageContent<'getTranslationValuesContentMessage'> {
  /** Translation key-value pairs */
  translations: { [localizationKey: string]: string };
}

/** Union type of all localization message contents */
type LocalizationMessageContents = LanguagesContentMessage
  | ReloadLocalizationKeysContentMessage
  | SwitchLanguageContentMessage
  | LocalizationsContentMessage
  | DisplayLocalizationKeysContentMessage
  | UpdateLocalizationContentMessage
  | IsTranslationDeactivationEnabledContentMessage
  | GetTranslationValuesContentMessage;

/** List of possible DataTypes for Localization messages */
export type LocalizationMessageDataTypes = MessageDataTypes<LocalizationMessageContents>;

/** List of all messages for Localization purpose */
export type AvailableLocalizationMessageContents = LocalizationMessageContents
  | ConnectContentMessage
  | RequestMessagesContentMessage<LocalizationMessageDataTypes>;

/**
 * Contextualization devtools exposed for localization in CMS integration
 */
export interface LocalizationContextualizationDevtools {
  /**
   * Is the translation deactivation enabled
   */
  isTranslationDeactivationEnabled(): boolean | Promise<boolean>;

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
   * Set up a listener on language change
   * @param fn called when the language is changed in the app
   * @returns Object with unsubscribe() method to prevent memory leaks
   */
  onLanguageChange: (fn: (language: string) => any) => { unsubscribe: () => void };

  /**
   * Clear all language change listeners
   */
  clearLanguageChangeListeners: () => void;

  /**
   * Updates the specified localization key/values for the current language
   * @param keyValues key/values to update
   * @param language if not provided, the current language value
   */
  updateLocalizationKeys: (keyValues: { [key: string]: string }, language?: string) => void | Promise<void>;

  /**
   * Reload a language from the language file
   * @see https://github.com/jsverse/transloco
   * @param language language to reload
   */
  reloadLocalizationKeys: (language?: string) => Promise<void>;
}
