import { TaskConfiguration, TaskConfigurationGenerator } from '@angular-devkit/schematics';
import { NodePackageName, NodePackageTaskOptions } from '@angular-devkit/schematics/tasks/package-manager/options';
import * as path from 'node:path';
import { getPackageManager } from '../../utility/package-manager-runner';

export class EslintFixTask implements TaskConfigurationGenerator<NodePackageTaskOptions> {
  constructor(public files: string[], public workingDirectory?: string, public configFile?: string) {
  }

  // TODO Find a way to catch linter errors without failing the ng add process
  public toConfiguration(): TaskConfiguration<NodePackageTaskOptions> {
    return {
      name: NodePackageName,
      options: {
        command: 'eslint',
        quiet: false,
        workingDirectory: this.workingDirectory,
        packageName: 'eslint ' + this.files.join(' ') +
          ' --fix' + (this.configFile ? ` --config ${this.configFile} --parser-options=tsconfigRootDir:${path.resolve(process.cwd(), path.dirname(this.configFile))}` : ''),
        packageManager: getPackageManager()
      }
    };
  }
}
