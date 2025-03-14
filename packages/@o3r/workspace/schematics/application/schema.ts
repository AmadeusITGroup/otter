import type {
  SchematicOptionObject,
} from '@o3r/schematics';

export interface NgGenerateApplicationSchema extends SchematicOptionObject {
  /** Application name */
  name: string;

  /** Target directory to generate the application */
  path?: string | undefined;

  /** Description of the new application */
  description?: string | undefined;

  /** Skip the linter process which includes EsLint and EditorConfig rules applying */
  skipLinter: boolean;

  /** Do not install dependency packages. */
  skipInstall: boolean;

  /** Use a pinned version for otter packages */
  exactO3rVersion?: boolean;
}
