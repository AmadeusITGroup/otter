import type {
  Rule
} from '@angular-devkit/schematics';
import {
  NodePackageInstallTask
} from '@angular-devkit/schematics/tasks';
import {
  lastValueFrom
} from 'rxjs';
import {
  getPackageManager,
  type SupportedPackageManagers
} from '../utility/package-manager-runner';

/**
 * Install the Otter packages
 * @deprecated use {@link setupDependencies} instead, will be removed in V11
 * @param options
 * @param options.packageManager
 */
export function install(options?: { packageManager?: SupportedPackageManagers }): Rule {
  return async (_, context) => {
    const packageManager = options?.packageManager || getPackageManager();
    context.logger.info('Running application install');
    context.addTask(new NodePackageInstallTask({ packageManager }));
    await lastValueFrom(context.engine.executePostTasks());
  };
}
