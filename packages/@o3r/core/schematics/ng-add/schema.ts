import type {
  NgAddOptions,
  SchematicOptionObject,
} from '@o3r/schematics';

export type PresetNames = 'basic' | 'recommended' | 'cms' | 'all';

export interface NgAddSchematicsSchema extends NgAddOptions, SchematicOptionObject {
  /** Preset of module list to automatically install */
  preset: PresetNames;

  /** Preset of non-official module list to automatically install */
  externalPresets?: string | undefined;

  /** Skip the linter process which includes the run of EsLint and EditorConfig rules */
  skipLinter: boolean;

  /** Initial git repository commit information. */
  commit: boolean | { name: string; email: string };

  /** Do not initialize a git repository. */
  skipGit: boolean;

  /** Add option to automatically register the devtool module */
  withDevtool: boolean;

  /** Force package installation (in case of unmet peer dependencies) */
  forceInstall: boolean;
}
