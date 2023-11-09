import type { SchematicOptionObject } from '@o3r/schematics';

export type PresetNames = 'basic' | 'cms';

export interface NgAddSchematicsSchema extends SchematicOptionObject {
  /** Skip the linter process */
  skipLinter: boolean;

  /** Skip the install process */
  skipInstall: boolean;

  /** Initial git repository commit information. */
  commit: boolean | { name: string; email: string };

  /** Do not initialize a git repository. */
  skipGit: boolean;
}
