import type {
  SchematicOptionObject,
} from '@o3r/schematics';

/** Available style languages */
export type AvailableLanguage = 'css' | 'sass' | 'scss';

export interface GenerateStyleSchematicsSchema extends SchematicOptionObject {
  /**
   * Language defined to generate the styling
   * Note: This will drive the default behavior of {@link variableType} and {@link variableReferenceType}
   */
  language: AvailableLanguage;

  /** Type of the variables to generate for a Design Token */
  variableType?: AvailableLanguage;

  /** Type of the variables to generate for a Design Token reference */
  variableReferenceType?: AvailableLanguage;

  /** Path patterns to the Design Token JSON files */
  designTokenFilePatterns: string | string[];

  /**
   * Path to generate the metadata for CMS
   * The Metadata will be generated only if the file path is specified
   */
  metadataOutput?: string;

  /**
   * Ignore private variables in the metadata generation
   */
  metadataIgnorePrivate?: boolean;

  /**
   * Output file where to generate the CSS
   *
   * If specified, all the generated CSS variables will be generated in the given file.
   * Otherwise, the output file will be determined based on the variable parameters
   */
  output?: string;

  /** File path to generate the variable if not determined by the specification */
  defaultStyleFile: string;

  /** Enable Watch mode */
  watch?: boolean;

  /** Root path of the files where the CSS will be generated */
  rootPath?: string;

  /** Determine if the process should stop in case of Design Token duplication */
  failOnDuplicate?: boolean;

  /** Prefix to append to generated variables */
  prefix?: string;

  /**
   * Generate the private variable in the given language
   * Note: if not provided, the private variable will not be rendered in the CSS language.
   */
  renderPrivateVariableTo?: Exclude<AvailableLanguage, 'css'>;

  /** Prefix to append to generated private variables */
  prefixPrivate?: string;

  /** Determine if the builder should fail if a missing Design Token reference is detected */
  failOnMissingReference?: boolean;

  /** Path to a template file to apply as default configuration to a Design Token extension */
  templateFile?: string | string[];

  /**
   * Path to the JSON file exposing an ordered array of RegExps applied to the token name which will define the priority of the generated variables.
   * Note: not matching tokens will default to ASC order.
   */
  sortOrderPatternsFilePath?: string;

  /**
   * Tags to surround the generated code in the outputted file.
   * It is used to detect the code to replace
   */
  codeEditTags?: { end: string; start: string };
}
