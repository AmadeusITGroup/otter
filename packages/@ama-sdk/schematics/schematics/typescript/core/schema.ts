import type { JsonObject } from '@angular-devkit/core';

export interface NgGenerateTypescriptSDKCoreSchematicsSchema extends JsonObject {
  /** Path to the swagger specification used to generate the SDK */
  swaggerSpecPath: string;
}
