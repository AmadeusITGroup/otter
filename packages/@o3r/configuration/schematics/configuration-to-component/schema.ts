import type { JsonObject } from '@angular-devkit/core';

export interface NgAddConfigSchematicsSchema extends JsonObject {
  /** Project name */
  projectName: string | null;

  /** Path to the component */
  path: string;

  /** Skip the linter process */
  skipLinter: boolean;

  /** Should change a component into an exposed component */
  exposeComponent: boolean;
}
