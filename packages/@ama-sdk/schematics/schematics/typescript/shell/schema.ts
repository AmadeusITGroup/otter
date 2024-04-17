import type { SchematicOptionObject } from '@o3r/schematics';

export interface NgGenerateTypescriptSDKShellSchematicsSchema extends SchematicOptionObject {
  /** Project name (NPM package scope, package.json name will be @{projectName}/{packageName}) */
  name?: string;

  /** Package name (package.json name will be @{projectName}/{packageName}) */
  package: string;

  /** Project description */
  description?: string | undefined;

  /** Directory where to generate the SDK */
  directory?: string | undefined;

  /** The npm package name where the spec file can be fetched */
  specPackageName?: string;

  /** The npm registry where the spec file can be fetched */
  specPackageRegistry?: string;

  /** The path inside the package where to find the spec file */
  specPackagePath: string;

  /** The version to target for the npm package where the spec file can be fetched */
  specPackageVersion?: string;

  /** Package manager to be used in the generated SDK */
  packageManager?: 'npm' | 'yarn' | undefined;

  /** Skip NPM install */
  skipInstall: boolean;

  /** Use a pinned version for otter packages */
  exactO3rVersion?: boolean;
}
