import type { SchematicOptionObject } from '@o3r/schematics';

export interface NgGenerateApplicationSchema extends SchematicOptionObject {
  /** Application name */
  name: string;

  /** Target directory to generate the application */
  path?: string | undefined;

  /** Description of the new application */
  description?: string | undefined;

  /** Skip the linter process */
  skipLinter: boolean;

  /** Do not install dependency packages. */
  skipInstall: boolean;
}
