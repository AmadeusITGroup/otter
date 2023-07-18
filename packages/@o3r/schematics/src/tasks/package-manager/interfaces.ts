/**
 * Duplication of the interface not exposed by the @angular-devkit/schematics
 */
export interface NodePackageInstallTaskOptions {
  packageManager?: 'yarn' | 'npm' | '';
  packageName?: string;
  workingDirectory?: string;
  quiet?: boolean;
  hideOutput?: boolean;
  allowScripts?: boolean;
}
