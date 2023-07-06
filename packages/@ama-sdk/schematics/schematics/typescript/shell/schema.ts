import type { JsonObject } from '@angular-devkit/core';

export interface NgGenerateTypescriptSDKShellSchematicsSchema extends JsonObject {
  /** Project name (NPM package scope, package.json name will be @{projectName}/{packageName}) */
  name: string;

  /** Package name (package.json name will be @{projectName}/{packageName}) */
  package: string;

  /** Project description */
  description: string;

  /** Package manager used by the project (npm or yarn) */
  packageManager: string;
}
