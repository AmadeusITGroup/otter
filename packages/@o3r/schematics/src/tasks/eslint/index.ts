import { TaskConfiguration, TaskConfigurationGenerator } from '@angular-devkit/schematics';
import { NodePackageName, NodePackageTaskOptions } from '@angular-devkit/schematics/tasks/package-manager/options';
import { getPackageManager } from '../../utility/package-manager-runner';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import type { WorkspaceSchema } from '../../interfaces';

/**
 * Linter options
 */
export interface LinterOptions {
  /**
   * Indicates if the linter process should succeed even if there are lint errors remaining
   * @default true
   */
  continueOnError?: boolean;
  /**
   * If enabled, only errors are reported (--quiet option of ESLint CLI)
   * @default true
   */
  hideWarnings?: boolean;

  /** Workspace configuration file */
  workspaceConfig?: WorkspaceSchema;

  /** Enforced NPM Package */
  enforcedNpmManager?: string;
}

export class EslintFixTask extends NodePackageInstallTask implements TaskConfigurationGenerator<NodePackageTaskOptions> {
  public linterOptions: LinterOptions;

  constructor(public files: string[], public workingDirectory?: string, public configFile?: string, options?: LinterOptions) {
    super({
      packageManager: getPackageManager(options)
    });
    this.linterOptions = {
      continueOnError: true,
      hideWarnings: true,
      ...options
    };
  }

  /** @inheritdoc */
  public toConfiguration(): TaskConfiguration<NodePackageTaskOptions> {
    return {
      name: NodePackageName,
      options: {
        command: 'exec',
        quiet: false,
        workingDirectory: this.workingDirectory,
        packageName: [
          'exec',
          'eslint',
          ...this.files,
          ...(this.packageName !== 'npm' ? [] : ['--']),
          '--fix',
          ...(this.linterOptions?.hideWarnings ? ['--quiet'] : []),
          ...(this.configFile ? ['--config', this.configFile] : []),
          ...(this.linterOptions?.continueOnError ? ['|| exit 0'] : [])
        ].join(' '),
        packageManager: getPackageManager()
      }
    };
  }
}
