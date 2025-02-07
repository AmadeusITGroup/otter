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

export class NodePackageLinkTask implements TaskConfigurationGenerator<NodePackageTaskOptions> {
  public quiet = true;

  constructor(public packageName?: string, public workingDirectory?: string) {}

  public toConfiguration(): TaskConfiguration<NodePackageTaskOptions> {
    return {
      name: NodePackageName,
      options: {
        command: 'link',
        quiet: this.quiet,
        workingDirectory: this.workingDirectory,
        packageName: `link ${this.packageName!}`,
        packageManager: getPackageManager()
      }
    } as TaskConfiguration<NodePackageTaskOptions>;
  }
}
