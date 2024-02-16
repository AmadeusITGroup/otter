import type { SchematicOptionObject } from '@o3r/schematics';

export interface NgGenerateTypescriptSDKShellSchematicsSchema extends SchematicOptionObject {
  /** Project name (NPM package scope, package.json name will be @{projectName}/{packageName}) */
  name: string;

  /** Package name (package.json name will be @{projectName}/{packageName}) */
  package: string;

  /** Project description */
  description?: string | undefined;

  /** Directory where to generate the SDK */
  directory?: string | undefined;

  /** Package manager to be used in the generated SDK */
  packageManager?: 'npm' | 'yarn' | undefined;

  /** Skip NPM install */
  skipInstall: boolean;

  /** Initial git repository commit information. */
  commit: boolean | { name?: string; email?: string; message?: string };

  /** Do not initialize a git repository. */
  skipGit: boolean;
}
