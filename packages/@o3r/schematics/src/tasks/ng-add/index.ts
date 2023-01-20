import { TaskConfiguration, TaskConfigurationGenerator } from '@angular-devkit/schematics';
import { NodePackageName, NodePackageTaskOptions } from '@angular-devkit/schematics/tasks/package-manager/options';

/**
 * Options to be passed to the ng add task
 */
export interface NgAddPackageOptions {
  /** Skip the questions */
  skipConfirmation?: boolean;

  /** working dir */
  workingDirectory?: string;

  /** The package which launched the ng add for the current one */
  parentPackageInfo?: string;
}

export class NodePackageNgAddTask implements TaskConfigurationGenerator<NodePackageTaskOptions> {
  public quiet = true;

  constructor(public packageName: string, public options?: NgAddPackageOptions) {}

  public toConfiguration(): TaskConfiguration<NodePackageTaskOptions> {
    return {
      name: NodePackageName,
      options: {
        command: 'ng add',
        quiet: this.quiet,
        workingDirectory: this.options?.workingDirectory,
        packageName: `ng add ${this.packageName}${this.options?.skipConfirmation ? ' --skip-confirmation' : ''}`,
        packageManager: 'yarn'
      }
    };
  }
}
