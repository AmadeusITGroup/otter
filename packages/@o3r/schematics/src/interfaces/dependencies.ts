import {
  type NodeDependencyType,
} from '@schematics/angular/utility/dependencies';

export interface DependencyInManifest {
  /**
   * Range of the dependency
   * @default 'latest'
   */
  range?: string;
  /**
   * Types of the dependency
   * @default [NodeDependencyType.Default]
   */
  types?: NodeDependencyType[];
}

/**
 * Options to be passed to the ng add task
 */
export interface NgAddSchematicOptions {
  /** Name of the project */
  projectName?: string | null;

  /** Skip the run of the linter*/
  skipLinter?: boolean;

  /** Skip the installation process */
  skipInstall?: boolean;

  [x: string]: any;
}

export interface DependencyToAdd {
  /** Enforce this dependency to be applied to Workspace's manifest only */
  toWorkspaceOnly?: boolean;
  /** List of dependency to register in manifest */
  inManifest: DependencyInManifest[];
  /** ng-add schematic option dedicated to the package */
  ngAddOptions?: NgAddSchematicOptions;
  /** Determine if the dependency require to be installed */
  requireInstall?: boolean;
  /**
   * Enforce the usage of tilde instead of caret in a dependency range
   * If not specified, the context option value will be used
   */
  enforceTildeRange?: boolean;
}
