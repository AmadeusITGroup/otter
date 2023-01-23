import type { JsonObject } from '@angular-devkit/core';

export interface StyleExtractorBuilderSchema extends JsonObject {
  /** Path to the output file */
  outputFile: string;

  /** Enable watch mode */
  watch: boolean;

  /** Write metadata inline */
  inline: boolean;

  /** Path patterns to styling file to extract */
  filePatterns: string[];

  /** List of libraries imported */
  libraries: string[];
}
