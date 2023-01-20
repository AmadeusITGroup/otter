import { SchematicContext, Tree } from '@angular-devkit/schematics';
import { NgAddPackageOptions, NodePackageNgAddTask } from '../../tasks/index';

/**
 * Ng add the packages
 *
 * @param packages
 * @param tree
 * @param context
 */
export function ngAddPackages(packages: string[], options?: NgAddPackageOptions) {
  return (tree: Tree, context: SchematicContext): Tree => {
    if (options?.parentPackageInfo) {
      context.logger.info(`'${options.parentPackageInfo}' has launched the 'ng add' for the following packages:`);
    }
    packages.forEach((packageName) => {
      context.logger.info(`Running ng add on following package: ${packageName}`);
      return context.addTask(new NodePackageNgAddTask(packageName, options));
    });
    return tree;
  };
}
