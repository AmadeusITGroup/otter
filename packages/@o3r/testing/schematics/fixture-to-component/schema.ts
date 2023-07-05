import type { JsonObject } from '@angular-devkit/core';

export interface NgAddFixtureSchematicsSchema extends JsonObject {
  /** Path to the component */
  path: string;

  /** Path to spec file of the component */
  specFilePath: string;

  /** Skip the linter process */
  skipLinter: boolean;
}
