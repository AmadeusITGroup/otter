import type { JsonObject } from '@angular-devkit/core';

export interface NgGenerateTypescriptSDKCoreSchematicsSchema extends JsonObject {
  /** Path to the swagger specification used to generate the SDK */
  specPath: string;

  /** Directory where to generate the SDK */
  directory: string;

  /** Package manager to be used in the generated SDK */
  packageManager: 'npm' | 'yarn' | '';

  /** Path to the spec generation configuration */
  specConfigPath: string;

  /**
   * Comma separated string of options to give to the openapi-generator-cli
   *
   * @example debugModels to log the full json structure used to generate models
   * @example debugOperations to log the full json structure used to generate operations
   *
   * @default ''
   */
  globalProperty: string;
}
