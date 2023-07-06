import type { JsonObject } from '@angular-devkit/core';

export interface NgAddAnalyticsSchematicsSchema extends JsonObject {
  /** Path to the component */
  path: string;

  /** Skip the linter process */
  skipLinter: boolean;

  /** Determine if the dummy analytics events should be generated */
  activateDummy: boolean;
}
