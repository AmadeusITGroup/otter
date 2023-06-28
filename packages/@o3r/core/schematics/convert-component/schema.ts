import type {JsonObject} from '@angular-devkit/core';

export interface ConvertToO3rComponentSchematicsSchema extends JsonObject {
  /** Path to the component to convert */
  path: string;

  /** Skip the linter process */
  skipLinter: boolean;
}
