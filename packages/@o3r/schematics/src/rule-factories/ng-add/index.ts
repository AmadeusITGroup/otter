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
    packages.forEach((packageName) => context.addTask(new NodePackageNgAddTask(packageName, options)));
    return tree;
  };
}
