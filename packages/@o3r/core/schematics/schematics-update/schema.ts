import { JsonObject } from '@angular-devkit/core';

export interface NgGenerateUpdateSchematicsSchema extends JsonObject {
  /** Project name */
  projectName: string | null;

  /** Version to apply the ngUpdate */
  version: string;

  /** Source directory containing the schematics */
  path: string | null;

  /** Skip the linter process */
  skipLinter: boolean;
}
