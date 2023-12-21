import type { JsonObject } from '@angular-devkit/core';

export interface LocalizationExtractorBuilderSchema extends JsonObject {

  /** Typescript configuration file to build the application */
  tsConfig: string;

  /** If true, extraction process is not interrupted in case of duplicate keys */
  ignoreDuplicateKeys: boolean;

  /** List of libraries imported */
  libraries: string[];

  /** Path to the output file */
  outputFile: string;

  /** Enable watch mode */
  watch: boolean;

  /** Write metadata inline */
  inline: boolean;

  /** Path patterns of files to add to the generated metadata */
  extraFilePatterns: string[];

  /** If true, metadata objects are sorted by keys */
  sortKeys: boolean;

  /** If activated, this option will fail when any property not supported by the CMS is found, it will be ignored if not activated */
  strictMode: boolean;
}
