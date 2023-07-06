import type { JsonObject } from '@angular-devkit/core';

export interface NgAddConfigSchematicsSchema extends JsonObject {
  /** Path to the component */
  path: string;

  /** Skip the linter process */
  skipLinter: boolean;
}
