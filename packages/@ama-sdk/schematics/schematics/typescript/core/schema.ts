import type { JsonObject } from '@angular-devkit/core';

export interface NgGenerateTypescriptSDKCoreSchematicsSchema extends JsonObject {
  /** Path to the swagger specification used to generate the SDK */
  specPath: string;

  /**
   * Comma separated string of options to give to the openapi-generator-cli
   * Example: debugModels to log the full json structure used to generate models
   * Example: debugOperations to log the full json structure used to generate operations
   *
   * @default null
   */
  globalProperty: string | null;
}
