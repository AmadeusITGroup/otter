import {JsonObject} from '@angular-devkit/core';

export interface NgGenerateRulesEngineToComponentSchematicsSchema extends JsonObject {
  /** Project name */
  projectName: string | null;

  /** Component Folder */
  path: string | null;

  /** Skip the linter process */
  skipLinter: boolean;
}
