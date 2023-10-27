import type { SchematicOptionObject } from '@o3r/schematics';

export interface NgGenerateSdkSchema extends SchematicOptionObject {
  /** Project name */
  name: string;

  /** Target directory to generate the module */
  path?: string | undefined;

  /** Description of the new module */
  description?: string | undefined;

  /** Skip the linter process */
  skipLinter: boolean;

  /** Do not install dependency packages. */
  skipInstall: boolean;

  /** Path to the swagger specification used to generate the SDK; If not provided, sdk shell will be generated */
  specPath?: string | undefined;
}
