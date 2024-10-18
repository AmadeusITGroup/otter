import type {
  SchematicOptionObject
} from '@o3r/schematics';

export interface NgGenerateTypescriptSDKCoreSchematicsSchema extends SchematicOptionObject {
  /** Path to the swagger specification used to generate the SDK */
  specPath?: string;

  /** Directory where to generate the SDK */
  directory?: string | undefined;

  /** Package manager to be used in the generated SDK */
  packageManager: 'npm' | 'yarn' | undefined;

  /** Path to the spec generation configuration */
  specConfigPath: string | undefined;

  /**
   * Comma separated string of options to give to the openapi-generator-cli
   * @example To log the full json structure used to generate models
   * ```typescript
   * 'debugModels'
   * ```
   * @example To log the full json structure used to generate operations
   * ```typescript
   * 'debugOperations'
   * ```
   * @example To generate the dates as string types
   * ```typescript
   * 'stringifyDate'
   * ```
   * @example To be able to extend the SDK models and ensure that revivers are generated
   * ```typescript
   * 'allowModelExtension'
   * ```
   */
  globalProperty: string | undefined;

  /** Run generator by key (from openapitools.json) */
  generatorKey: string | undefined;

  /** Output path for the generated SDK */
  outputPath: string | undefined;

  /** Path to a custom generator */
  generatorCustomPath: string | undefined;

  /** Specifies the rules to be enabled in OpenAPI normalizer */
  openapiNormalizer: string | undefined;
}
