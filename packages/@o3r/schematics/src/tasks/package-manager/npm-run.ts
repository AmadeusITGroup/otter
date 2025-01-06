import {
  TaskConfiguration,
  TaskConfigurationGenerator,
} from '@angular-devkit/schematics';
import {
  NodePackageName,
  NodePackageTaskOptions,
} from '@angular-devkit/schematics/tasks/package-manager/options';
import {
  getPackageManager,
} from '../../utility/package-manager-runner';

/**
 * Configuration used to run an Npm script during schematics execution
 * Note that this only works if the necessary files are created on the disk (doesn't work on tree)
 */
export class NpmRunTask implements TaskConfigurationGenerator<NodePackageTaskOptions> {
  constructor(private readonly script: string, private readonly workingDirectory?: string) {}

  public toConfiguration(): TaskConfiguration<NodePackageTaskOptions> {
    return {
      name: NodePackageName,
      options: {
        command: 'run',
        packageName: `run ${this.script}`,
        workingDirectory: this.workingDirectory,
        packageManager: getPackageManager()
      }
    };
  }
}
