import type { JsonObject } from '@angular-devkit/core';

export interface NgGenerateTypescriptSDKShellSchematicsSchema extends JsonObject {
  /** Project name (NPM package scope) */
  name: string;

  /** Package name */
  package: string;

  /** Project description */
  description: string;
}
