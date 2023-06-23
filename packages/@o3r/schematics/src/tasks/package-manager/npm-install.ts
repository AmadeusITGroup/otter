import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import type { NodePackageInstallTaskOptions } from './interfaces';
import { getPackageManagerName } from '../../utility';
import { NodePackageName } from '@angular-devkit/schematics/tasks/package-manager/options';

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
