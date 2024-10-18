import type {
  SchematicOptionObject
} from '@o3r/schematics';

export interface StyleExtractorBuilderSchema extends SchematicOptionObject {
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

  /** Library/Application name to be assigned into metadata */
  name?: string | undefined;

  /** Will not display warning for duplicated variable */
  ignoreDuplicateWarning: boolean;

  /**
   * Will display only a warning for invalid value
   * @default true
   */
  ignoreInvalidValue: boolean;
}
