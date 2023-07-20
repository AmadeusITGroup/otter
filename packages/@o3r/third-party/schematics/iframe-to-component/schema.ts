import type { JsonObject } from '@angular-devkit/core';

export interface NgAddIframeSchematicsSchema extends JsonObject {
  /** Path to the component */
  path: string;

  /** Skip the linter process */
  skipLinter: boolean;
}
