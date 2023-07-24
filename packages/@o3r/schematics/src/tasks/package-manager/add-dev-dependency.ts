import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { NodePackageName } from '@angular-devkit/schematics/tasks/package-manager/options';
import { getPackageManager, getWorkspaceConfig } from '../../utility';
import { NodePackageInstallTaskOptions } from './interfaces';

/**
 * Install new dev dependency on your package
 */
export class AddDevInstall extends NodePackageInstallTask {
  public quiet = false;

  constructor(options?: NodePackageInstallTaskOptions) {
    super(options as any);
    this.packageManager = getPackageManager({
      workspaceConfig: options?.tree && getWorkspaceConfig(options.tree),
      enforcedNpmManager: options?.packageName
    });
  }


  /** @inheritdoc */
  public toConfiguration() {
    const defaultConfig = super.toConfiguration();
    return {
      ...defaultConfig,
      name: NodePackageName,
      options: {
        ...defaultConfig.options,
        command: 'install',
        packageName: `${this.packageName!} ${this.packageManager === 'yarn' ? '--prefer-dev' : '--save-dev'}`
      }
    };
  }
}

