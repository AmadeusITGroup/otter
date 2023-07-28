import type { SchematicOptionObject } from '@o3r/schematics';

export interface NgGenerateModuleSchema extends SchematicOptionObject {
  /** Project name */
  name: string;

  /** Target directory to generate the module */
  path: string;

  /** Description of the new module */
  description: string | undefined;

  /** Prefix use to package future generation */
  prefix: string | undefined;

  /** Name of the Nx Project (applied only in Nx Monorepo) */
  projectName: string | undefined;

  /** Skip the linter process */
  skipLinter: boolean;

  /** Do not install dependency packages. */
  skipInstall: boolean;
}
