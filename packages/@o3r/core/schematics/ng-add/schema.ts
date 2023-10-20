import type { SchematicOptionObject } from '@o3r/schematics';

export type PresetNames = 'basic' | 'cms';

export interface NgAddSchematicsSchema extends SchematicOptionObject {
  /** Preset of module list to automatically install */
  preset: PresetNames;

  /** Preset of non-official module list to automatically install */
  externalPresets?: string | undefined;

  /** Project name */
  projectName?: string | undefined;

  /** Skip the linter process */
  skipLinter: boolean;

  /** Skip the install process */
  skipInstall: boolean;

  /** Initial git repository commit information. */
  commit: boolean | { name: string; email: string };

  /** Do not initialize a git repository. */
  skipGit: boolean;

  /** Add option to automatically register the devtool module */
  withDevtool: boolean;
}
