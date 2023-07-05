import type { JsonObject } from '@angular-devkit/core';

export interface NgAddLocalizationSchematicsSchema extends JsonObject {
  /** Path to the component */
  path: string;

  /** Path to spec file of the component */
  specFilePath: string | null;

  /** Skip the linter process */
  skipLinter: boolean;

  /** Determine if the dummy localization should be generated */
  activateDummy: boolean | null;
}
