import type { SchematicOptionObject } from '@o3r/schematics';

export interface NgAddSchematicsSchema extends SchematicOptionObject {
  /** Project name */
  projectName: string | undefined;

  /** Skip the linter process */
  skipLinter: boolean;

  /** Skip the install process */
  skipInstall: boolean;
}
