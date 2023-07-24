import { Tree } from '@angular-devkit/schematics';

/**
 * Duplication of the interface not exposed by the @angular-devkit/schematics
 */
export interface NodePackageInstallTaskOptions {
  tree?: Tree;
  packageManager?: 'yarn' | 'npm' | '';
  packageName?: string;
  workingDirectory?: string;
  quiet?: boolean;
  hideOutput?: boolean;
  allowScripts?: boolean;
}
