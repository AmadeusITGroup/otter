import {
  TaskConfiguration,
  TaskConfigurationGenerator
} from '@angular-devkit/schematics';
import {
  NodePackageName,
  NodePackageTaskOptions
} from '@angular-devkit/schematics/tasks/package-manager/options';
import {
  getPackageManager
} from '../../utility/package-manager-runner';

/**
 * Configuration used to run an Npm binary during schematics execution
 * Note that this only works if the necessary files are created on the disk (doesn't work on tree)
 */
export class NpmExecTask implements TaskConfigurationGenerator<NodePackageTaskOptions> {
  constructor(private readonly script: string, private readonly args: string[] = [], private readonly workingDirectory?: string) {}

  public toConfiguration(): TaskConfiguration<NodePackageTaskOptions> {
    const packageManager = getPackageManager();
    return {
      name: NodePackageName,
      options: {
        command: 'exec',
        packageName: `exec ${this.script} ${packageManager === 'npm' ? '-- ' : ''}${this.args.map((arg) => `"${arg}"`).join(' ')}`,
        workingDirectory: this.workingDirectory,
        packageManager
      }
    };
  }
}
