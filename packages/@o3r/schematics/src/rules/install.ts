import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { lastValueFrom } from 'rxjs';
import { getPackageManager } from '../utility/package-manager-runner';

/**
 * Install the Otter packages
 * @param tree
 * @param context
 */
export async function install(tree: Tree, context: SchematicContext): Promise<Rule> {
  const packageManager = getPackageManager();
  context.logger.info('Running application install');
  context.addTask(new NodePackageInstallTask({packageManager}));
  await lastValueFrom(context.engine.executePostTasks());
  return () => tree;
}
