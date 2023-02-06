import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NgAddPackageOptions, NodePackageNgAddTask } from '../../tasks/index';

/**
 * Install via `ng add` a list of npm packages.
 *
 * @param packages List of packages to be installed via `ng add`
 * @param options install options
 */
export function ngAddPackages(packages: string[], options?: NgAddPackageOptions): Rule {
  const getInstalledVersion = async (packageName: string) => {
    try {
      return (await import(`${packageName}/package.json`)).version;
    } catch (e) {
      return;
    }
  };
  return async (_tree: Tree, context: SchematicContext) => {
    if (packages.length > 0) {
      context.logger.info(`'${options?.parentPackageInfo || ''}' - 'ng add' has been launched for the following packages:`);
      for (const packageName of packages) {
        const installedVersion = await getInstalledVersion(packageName);
        if (!installedVersion || options?.version !== installedVersion) {
          context.logger.info(`Running ng add for: ${packageName}${options?.version ? ' with version: ' + options.version : ''}`);
          context.addTask(new NodePackageNgAddTask(packageName, options));
        }
      }
    }
    return;
  };
}
