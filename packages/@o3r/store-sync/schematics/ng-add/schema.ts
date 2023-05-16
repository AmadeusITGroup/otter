import type { JsonObject } from '@angular-devkit/core';

export interface NgAddSchematicsSchema extends JsonObject {
  /** Project name */
  projectName: string | null;

  /** Skip the linter process */
  skipLinter: boolean;

  /** Skip the install process */
  skipInstall: boolean;
}
