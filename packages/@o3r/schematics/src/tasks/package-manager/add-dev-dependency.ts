import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { NodePackageName } from '@angular-devkit/schematics/tasks/package-manager/options';
import { getPackageManager, getWorkspaceConfig } from '../../utility/index';
import { NodePackageInstallTaskOptions } from './interfaces';

/**
 * Install new dev dependency on your package
 * @deprecated use {@link setupDependencies} instead, will be removed in V11
 */
export class AddDevInstall extends NodePackageInstallTask {
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
    const defaultConfig = super.toConfiguration();
    return {
      ...defaultConfig,
      name: NodePackageName,
      options: {
        ...defaultConfig.options,
        command: 'install',
        packageName: `${this.packageName!} ${this.packageManager === 'yarn' ? '--prefer-dev' : '--save-dev'}${this.force && this.packageManager === 'npm' ? ' --force' : ''}`
      }
    };
  }
}

