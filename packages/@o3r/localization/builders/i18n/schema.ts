import type {JsonObject} from '@angular-devkit/core';

export interface LocalizationConfig extends JsonObject {
  /**
   * Glob to define how to find localization json files
   */
  localizationFiles: string[];

  /**
   * Folder path for the i18n folder relative to the localization json file
   * @default 'i18n'
   */
  i18nFolderPath: string;
}

export interface I18nBuilderSchema extends JsonObject {
  /**
   * List of LocalizationConfig
   */
  localizationConfigs: LocalizationConfig[];

  /**
   * Name of the file for the default language
   * @default 'en-GB.json'
   */
  defaultLanguageFile: string;
}
