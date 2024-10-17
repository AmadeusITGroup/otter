import type { NodeDependencyType } from '@schematics/angular/utility/dependencies';

/**
 * Options to be passed to the ng add task
 */
export interface NgAddPackageOptions {
  /** Skip the questions */
  skipConfirmation?: boolean;

  /** working dir */
  workingDirectory?: string;

  /** version to install */
  version?: string;

  /** The package which launched the ng add for the current one */
  parentPackageInfo?: string;

  /** Name of the project */
  projectName?: string | null;

  /**
   * Type of dependency to install
   */
  dependencyType?: NodeDependencyType;

  /** Flag to skip the execution of ng add and only install the package. Used mostly for external packages */
  skipNgAddSchematicRun?: boolean;
}
