/**
 * Describes configuration for LocalizationModule
 */
export interface LocalizationConfiguration {
  /** List of available languages */
  supportedLocales: string[];
  /** Application display language */
  language?: string;
  /** Url to fetch translation bundles from */
  endPointUrl: string;
  /** Prefix endPoinrUrl with dynamicContentPath provided by DynamicContentPath */
  useDynamicContent: boolean;
  /** List of RTL language codes */
  rtlLanguages: string[];
  /**
   * Fallback language map of resource in case translation in language does not exist.
   * translate to unsupported language will try to map to supportedLocales from below property.
   * @example
   * ```typescript
   * {
   *   supportedLocales: ['en-GB', 'en-US', 'fr-FR'],
   *   fallbackLocalesMap: {'en-CA': 'en-US', 'de': 'fr-FR'}
   * }
   * // translate to en-CA -> fallback to en-US, translate to de-DE -> fallback to fr-FR,
   * // translate to en-NZ -> fallback to en-GB, translate to en -> fallback to en-GB.
   * ```
   */
  fallbackLocalesMap?: {
    [supportedLocale: string]: string;
  };
  /** Fallback language of resource in case translation in language does not exist */
  fallbackLanguage: string;
  /** Path relative to published folder where webpack will copy translation bundles */
  bundlesOutputPath: string;
  /** Debug mode switch */
  debugMode: boolean;
  /** Query parameters for fetching the localization resources */
  queryParams?: {[key: string]: string};
  /** Fetch options object as per https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters */
  fetchOptions?: RequestInit;
  /** Enable the ability to switch the translations on and off at runtime. */
  enableTranslationDeactivation: boolean;
  /**
   * Merge the translations from DynamicContentPath with the local translations
   * Warning: Enable this option will download two localization bundles and can delay the display of the text on application first page
   * @default false
   */
  mergeWithLocalTranslations: boolean;
}

/**
 * Default configuration for LocalizationModule
 */
export const DEFAULT_LOCALIZATION_CONFIGURATION: LocalizationConfiguration = {
  supportedLocales: [],
  endPointUrl: '',
  useDynamicContent: false,
  rtlLanguages: ['ar', 'he'],
  fallbackLanguage: 'en',
  bundlesOutputPath: '',
  debugMode: false,
  enableTranslationDeactivation: false,
  mergeWithLocalTranslations: false
};
