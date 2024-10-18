import type {
  JsonObject
} from '@angular-devkit/core';

export interface LocalizationBuilderSchema extends JsonObject {

  /** Target to build */
  browserTarget: string;

  /** Target translation extracter */
  localizationExtracterTarget: string;

  /** Output path to localization bundles */
  outputPath: string;

  /** List of languages to generate */
  locales: string[];

  /** Map that associates to a locale, the other locale / language that should be used as default values */
  defaultLanguageMapping: Record<string, string>;

  /** Should missing translations for a given language be filled from the default values from the metadata or not */
  useMetadataAsDefault: boolean;

  /** Do not resolve references when the value of the child key has been customized (eg. is neither undefined or the default value) */
  ignoreReferencesIfNotDefault: boolean;

  /** Asset folder containing the package translations */
  assets: string[] | string | null;

  /** Check if a translation from the asset folder is not a registered translation */
  checkUnusedTranslation: boolean;

  /** Enable watch mode */
  watch: boolean;

  /** Throws an error if there is missing metadata */
  failIfMissingMetadata: boolean;
}
