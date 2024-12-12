import type {
  SchematicOptionObject,
} from '@o3r/schematics';

/** Monorepo manager to use */
export type MonorepoManager = 'lerna' | 'none';

export interface NgAddSchematicsSchema extends SchematicOptionObject {
  /** Skip the linter process */
  skipLinter: boolean;

  /** Skip the install process */
  skipInstall: boolean;

  /** Initial git repository commit information. */
  commit: boolean | { name: string; email: string };

  /** Do not initialize a git repository. */
  skipGit: boolean;

  /** Use a pinned version for otter packages */
  exactO3rVersion?: boolean;

  /** Monorepo manager to use */
  monorepoManager: MonorepoManager;
}
