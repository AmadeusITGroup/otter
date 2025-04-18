import type {
  SchematicOptionObject,
} from '@o3r/schematics';

/** Monorepo manager to use */
export type MonorepoManager = 'lerna' | 'none';

export interface NgAddSchematicsSchema extends SchematicOptionObject {
  /** Skip the linter process which includes the run of EsLint and EditorConfig rules */
  skipLinter: boolean;

  /** Skip the install process */
  skipInstall?: boolean;

  /** Initial git repository commit information. */
  commit: boolean | { name: string; email: string };

  /** Do not initialize a git repository. */
  skipGit: boolean;

  /** Skip the setup of CommitLint and Lint-Staged configurations and pre-commit checks */
  skipPreCommitChecks: boolean;

  /** Use a pinned version for otter packages */
  exactO3rVersion?: boolean;

  /** Monorepo manager to use */
  monorepoManager: MonorepoManager;

  /** Skip adding VSCode tools */
  skipVscodeTools?: boolean;

  /** Skip adding Renovate config */
  skipRenovate?: boolean;

  /** Skip adding Editor config */
  skipEditorConfigSetup?: boolean;
}
