import type { JsonObject } from '@angular-devkit/core';

export interface NgGenerateTypescriptSDKCoreSchematicsSchema extends JsonObject {
  /** Path to the swagger specification used to generate the SDK */
  specPath: string;

  /** Directory where to generate the SDK */
  directory: string;

  /** Package manager to be used in the generated SDK */
  packageManager: 'npm' | 'yarn' | '';
}
