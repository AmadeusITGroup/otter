import { SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

/**
 * Install the Otter packages
 *
 * @param tree
 * @param context
 */
export function install(tree: Tree, context: SchematicContext): Tree {
  const installOptions = process.env && process.env.npm_execpath && process.env.npm_execpath.indexOf('yarn') === -1 ? {} : { packageManager: 'yarn' };
  context.addTask(new NodePackageInstallTask(installOptions));
  return tree;
}
