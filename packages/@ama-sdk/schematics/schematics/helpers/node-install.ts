import {
  NodePackageInstallTask
} from '@angular-devkit/schematics/tasks';
import {
  NodePackageName
} from '@angular-devkit/schematics/tasks/package-manager/options';
import type {
  SupportedPackageManagers
} from '@o3r/schematics';

/**
 * Get the Package Manager
 * @param enforcedNpmManager package manager to enforce
 */
export function getPackageManagerName(enforcedNpmManager?: SupportedPackageManagers | '' | null): SupportedPackageManagers {
  return enforcedNpmManager || (process.env?.npm_execpath?.includes('yarn') ? 'yarn' : 'npm');
}

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

/**
 * Install dev dependency on your application
 */
export class DevInstall extends NodePackageInstallTask {
  public quiet = false;

  constructor(options?: NodePackageInstallTaskOptions) {
    super(options as any);
    this.packageManager = getPackageManagerName(options?.packageManager);
  }

  /** @inheritdoc */
  public toConfiguration() {
    return {
      name: NodePackageName,
      options: {
        command: 'install',
        quiet: this.quiet,
        workingDirectory: this.workingDirectory,
        packageName: `${this.packageName!} ${this.packageManager === 'yarn' ? '--prefer-dev' : '-D'}`,
        packageManager: this.packageManager
      }
    };
  }
}

/**
 * Run NPM Install
 */
export class NpmInstall extends NodePackageInstallTask {
  public quiet = false;

  constructor(options?: NodePackageInstallTaskOptions) {
    super(options as any);
    this.packageManager = getPackageManagerName(options?.packageManager);
  }

  /** @inheritdoc */
  public toConfiguration() {
    const config = super.toConfiguration();
    return {
      ...config,
      name: NodePackageName,
      options: {
        ...config.options,
        command: 'install',
        quiet: this.quiet,
        packageManager: this.packageManager
      }
    };
  }
}
