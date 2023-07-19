import { JsonObject } from '@angular-devkit/core';

export interface NgGenerateModuleSchema extends JsonObject {
  /** Project name */
  name: string;

  /** Target directory to generate the module */
  path: string;

  /** Description of the new module */
  description: string | null;

  /** Prefix use to package future generation */
  prefix: string | null;

  /** Name of the Nx Project (applied only in Nx Monorepo) */
  projectName: string | null;

  /** Skip the linter process */
  skipLinter: boolean;
}
