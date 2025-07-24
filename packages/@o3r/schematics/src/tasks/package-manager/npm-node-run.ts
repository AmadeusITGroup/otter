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
  type SupportedPackageManagers,
} from '../../utility/package-manager-runner';

/**
 * Configuration used to run Node script via Package Manager.
 * Warning: The command only supports single quote strings when run with NPM. In NPM, the " character will be replaced by its char code
 * Note that this only works if the necessary files are created on the disk (doesn't work on tree)
 */
export class NodeRunScriptTask implements TaskConfigurationGenerator<NodePackageTaskOptions> {
  constructor(
    private readonly script: string,
    private readonly workingDirectory?: string,
    private readonly packageManager?: SupportedPackageManagers
  ) {}

  public toConfiguration(): TaskConfiguration<NodePackageTaskOptions> {
    const packageManager = this.packageManager || getPackageManager();
    const scriptString = JSON.stringify(this.script);
    const scriptStringInQuotes = this.script
      .replace(/"/g, '\' + String.fromCharCode(34) + \'');
    const script = packageManager === 'npm'
      ? `exec --call "node -e \\"${scriptStringInQuotes}\\""`
      : `node -e ${scriptString}`;
    return {
      name: NodePackageName,
      options: {
        command: 'exec',
        packageName: script,
        workingDirectory: this.workingDirectory,
        packageManager
      }
    };
  }
}
