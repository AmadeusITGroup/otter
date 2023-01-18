/** Type of the spec to generate */
export type OutputFormat = 'yaml' | 'split' | 'json';

/** Tree-shaking strategy to be used */
export type TreeShakingStrategy = 'bottom-up' | 'top-down' | 'both';

/**
 * Builder configurations
 */
export interface BuilderConfiguration {
  /** Blacklist of paths to not generate in the final Swagger Spec */
  pathsBlackList?: string[];

  /** Whitelist of paths to generate in the final Swagger Spec */
  pathsWhiteList?: string[];

  /** Name of the Artifact associated to the generated Swagger Spec */
  artifact?: string;

  /** Override the Version of the Swagger Spec */
  setVersion?: string;

  /** If enabled, the version from the current package.json will be applied to the final swagger specification */
  setVersionAuto?: boolean;

  /**
   * List of input specs to merge
   * This list will be merge to the one provided as inputs
   */
  specs?: string[];

  /** Output path to generate the spec */
  output: string;

  /**
   * Type of the spec to generate
   * yaml: Single Yaml file containing the all spec
   * split: Multiple Yaml files of the Spec
   */
  outputFormat: OutputFormat;

  /** Enable swagger validation of the final spec */
  validation?: boolean;

  /** Enable the AWS compatibility mode */
  awsCompat?: boolean;

  /**
   * Enable Tree Shaking of the swagger spec
   * The Tree Shaking will remove the Definitions and Parameters not used by any paths
   */
  treeShaking?: boolean;

  /**
   * Tree-shaking strategy to be used
   * - 'bottom-up': start from definitions and recursively remove all unreferenced
   * - 'top-down': start from paths and only keep deeply accessible definitions
   *
   * @default 'bottom-up'
   */
  treeShakingStrategy?: TreeShakingStrategy;

  /** Ignore Paths conflicts and use the last one as final Path */
  ignoreConflict?: boolean;

  /** Flag definitions with x-api-ref vendor extension */
  flagDefinition?: boolean;

  /** Build the swagger spec to be MDK compliant */
  buildMdkSpec?: boolean;

  /** Merge based interface with new override in case of definition name conflict */
  flattenConflictedDefinition?: boolean;
}
