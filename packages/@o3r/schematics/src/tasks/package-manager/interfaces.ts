import type {
  Tree
} from '@angular-devkit/schematics';

/**
 * Duplication of the interface not exposed by the @angular-devkit/schematics
 */
export interface NodePackageInstallTaskOptions {
  /** Tree */
  tree?: Tree;
  /** Package Manager */
  packageManager?: 'yarn' | 'npm' | '';
  /** Package Name */
  packageName?: string;
  /** Current working directory */
  workingDirectory?: string;
  /** quiet argument to package manager command */
  quiet?: boolean;
  /** Hide output  */
  hideOutput?: boolean;
  /** Allow post/pre-install script run */
  allowScripts?: boolean;
  /** force install */
  force?: boolean;
}
