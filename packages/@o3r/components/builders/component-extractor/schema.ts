import type {
  JsonObject
} from '@angular-devkit/core';
import type {
  CategoryDescription
} from '@o3r/core';

export interface ComponentExtractorBuilderSchema extends JsonObject {

  /** Typescript configuration file to build the application */
  tsConfig: string;

  /** List of libraries imported */
  libraries: string[];

  /** Path to the output file for component data */
  componentOutputFile: string;

  /** Path to the output file for configuration data */
  configOutputFile: string;

  /** Library/Application name to be assigned into metadata */
  name: string | null;

  /** Enable watch mode */
  watch: boolean;

  /** Write metadata inline */
  inline: boolean;

  /** Path pattern to watch for component files */
  filePattern: string;

  /** Fail if any unsupported property is found */
  strictMode: boolean;

  /** Includes components flagged as ExposedComponent coming from a library */
  exposedComponentSupport: boolean;

  /** Include placeholder metadata file */
  placeholdersMetadataFilePath: string | null;

  /**
   * List of global categories with description
   */
  /* Adding `& JsonObject` as workaround */
  globalConfigCategories: (CategoryDescription & JsonObject)[];
}
