import type {
  SchematicOptionObject,
} from '@o3r/schematics';

export interface NgAddSchematicsSchema extends SchematicOptionObject {
  /** Project name */
  projectName?: string | undefined;
  /** Skip the linter process which includes the run of EsLint and EditorConfig rules */
  skipLinter: boolean;
  /** Skip the install process */
  skipInstall: boolean;
  /** Use a pinned version for otter packages */
  exactO3rVersion?: boolean;
}
