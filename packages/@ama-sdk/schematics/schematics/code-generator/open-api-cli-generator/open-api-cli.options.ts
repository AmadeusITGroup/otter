import * as path from 'node:path';
import {
  CodegenTaskOptions
} from '../code-generator';

/**
 * Options to pass the {@link OpenApiCliGenerator} to configure the generator
 * and to specify the spec to generate
 */
export type OpenApiCliOptions = CodegenTaskOptions & {
  /**
   * The version of the Open Api Generator jar that will be downloaded and used to generate your sdk
   * If null, it will use the one already defined in your project:
   * - the one defined in your openapitools.json
   * - the latest version if openapitools.json is missing
   *  @default ''
   */
  generatorVersion: string;
  /**
   * The Open Api Generator to run
   * @default 'typescriptFetch' - our own typescript custom generator
   */
  generatorName: string;
  /**
   * Path to a custom generator
   * @default path to our own custom typescript generator
   */
  generatorCustomPath: string;
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
   * @default ''
   */
  globalProperty: string;
  /**
   * Run generator by key (from openapitools.json)
   * @default ''
   */
  generatorKey: string;
  /**
   * Specifies the rules to be enabled in OpenAPI normalizer
   * @default ''
   */
  openapiNormalizer: string;
};

/**
 * Default options to run our custom typescript generator
 */
export const defaultTypescriptGeneratorOptions: OpenApiCliOptions = {
  generatorVersion: '',
  generatorName: 'typescriptFetch',
  generatorCustomPath: path.join(__dirname, '..', '..', 'typescript', 'core', 'openapi-codegen-typescript', 'target', 'typescriptFetch-openapi-generator.jar'),
  specPath: 'swagger-spec.yaml',
  outputPath: '.',
  specConfigPath: '',
  globalProperty: '',
  generatorKey: '',
  openapiNormalizer: ''
};
