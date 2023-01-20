import { SchematicContext, Tree } from '@angular-devkit/schematics';
import { NgAddPackageOptions, NodePackageNgAddTask } from '../../tasks/index';

/**
 * Install via `ng add` a list of npm packages.
 *
 * @param packages List of packages to be installed via `ng add`
 * @param options install options
 */
export function ngAddPackages(packages: string[], options?: NgAddPackageOptions) {
  return (tree: Tree, context: SchematicContext): Tree => {
    if (packages.length > 0) {
      context.logger.info(`'${options?.parentPackageInfo || ''}' - 'ng add' has been launched for the following packages:`);
      packages.forEach((packageName) => {
        context.logger.info(`Running ng add for: ${packageName}`);
        return context.addTask(new NodePackageNgAddTask(packageName, options));
      });
    }
    return tree;
  };
}
