import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { getPackageManager } from '@o3r/dev-tools';
import { lastValueFrom } from 'rxjs';

/**
 * Install the Otter packages
 *
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
