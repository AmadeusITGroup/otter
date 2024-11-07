import {
  NodePackageInstallTask,
} from '@angular-devkit/schematics/tasks';
import {
  NodePackageName,
} from '@angular-devkit/schematics/tasks/package-manager/options';
import {
  getPackageManager,
  getWorkspaceConfig,
} from '../../utility/index';
import type {
  NodePackageInstallTaskOptions,
} from './interfaces';

/**
 * Run NPM Install
 */
export class NpmInstall extends NodePackageInstallTask {
  public quiet = false;
  public force = false;

  constructor(options?: NodePackageInstallTaskOptions) {
    super(options as any);
    this.packageManager = getPackageManager({
      workspaceConfig: options?.tree && getWorkspaceConfig(options.tree),
      enforcedNpmManager: options?.packageName
    });
    this.force = !!options?.force;
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
        packageManager: `${this.packageManager!}${this.force && this.packageManager === 'npm' ? ' --force' : ''}`
      }
    };
  }
}
