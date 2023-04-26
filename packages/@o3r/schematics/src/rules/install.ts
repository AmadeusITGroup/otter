import {Rule, SchematicContext, Tree} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import {lastValueFrom} from 'rxjs';

/**
 * Install the Otter packages
 *
 * @param tree
 * @param context
 */
export async function install(tree: Tree, context: SchematicContext): Promise<Rule> {
  const installOptions = process.env && process.env.npm_execpath && process.env.npm_execpath.indexOf('yarn') === -1 ? {} : { packageManager: 'yarn' };
  context.logger.info('Running application install');
  context.addTask(new NodePackageInstallTask(installOptions));
  await lastValueFrom(context.engine.executePostTasks());
  return () => tree;
}
