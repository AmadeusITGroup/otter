import { TaskConfiguration, TaskConfigurationGenerator } from '@angular-devkit/schematics';
import { NodePackageName, NodePackageTaskOptions } from '@angular-devkit/schematics/tasks/package-manager/options';
import { getPackageManager } from '../../utility/package-manager-runner';

/**
 * Linter options
 */
export interface LinterOptions {
  /**
   * Indicates if the linter process should succeed even if there are lint errors remaining
   *
   * @default true
   * @deprecated will be removed in v10, please use `continueOnError`
   */
  force?: boolean;
  /**
   * Indicates if the linter process should succeed even if there are lint errors remaining
   *
   * @default true
   */
  continueOnError?: boolean;
  /**
   * If enabled, only errors are reported (--quiet option of ESLint CLI)
   *
   * @default true
   */
  hideWarnings?: boolean;
}

export class EslintFixTask implements TaskConfigurationGenerator<NodePackageTaskOptions> {
  public linterOptions: LinterOptions;

  constructor(public files: string[], public workingDirectory?: string, public configFile?: string, options?: LinterOptions) {
    this.linterOptions = {
      continueOnError: options?.force ?? true,
      force: true,
      hideWarnings: true,
      ...options
    };
  }

  public toConfiguration(): TaskConfiguration<NodePackageTaskOptions> {
    return {
      name: NodePackageName,
      options: {
        command: 'eslint',
        quiet: false,
        workingDirectory: this.workingDirectory,
        packageName: [
          'eslint',
          ...this.files,
          '--fix',
          ...(this.linterOptions?.hideWarnings ? ['--quiet'] : []),
          ...(this.configFile ? ['--config', this.configFile] : []),
          ...(this.linterOptions?.continueOnError ?? this.linterOptions?.force ? ['|| exit 0'] : [])
        ].join(' '),
        packageManager: getPackageManager()
      }
    };
  }
}
