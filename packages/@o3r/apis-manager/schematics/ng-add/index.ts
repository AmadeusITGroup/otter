import { chain, noop, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NgAddSchematicsSchema } from './schema';

import * as path from 'node:path';

/**
 * Add Otter apis manager to an Angular Project
 *
 * @param options
 */
export function ngAdd(options: NgAddSchematicsSchema): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    try {
      const { ngAddPackages, getO3rPeerDeps, applyEsLintFix, getProjectFromTree } = await import('@o3r/schematics');
      const { updateApiDependencies } = await import('../helpers/update-api-deps');
      const depsInfo = getO3rPeerDeps(path.resolve(__dirname, '..', '..', 'package.json'));
      const rulesToExecute: Rule[] = [];
      const workspaceProject = getProjectFromTree(tree, options.projectName || undefined);
      if (workspaceProject.projectType === 'application') {
        rulesToExecute.push(updateApiDependencies());
      }

      return () => chain([
        ...rulesToExecute,
        options.skipLinter ? noop : applyEsLintFix(),
        ngAddPackages(depsInfo.o3rPeerDeps, { skipConfirmation: true, version: depsInfo.packageVersion, parentPackageInfo: depsInfo.packageName })
      ])(tree, context);

    } catch (e) {
      // o3r apis-manager needs o3r/schematics as peer dep.
      context.logger.error(`[ERROR]: Adding @o3r/apis-manager has failed.
      You need to install '@o3r/schematics' to be able to use the o3r apis-manager package. Please run 'ng add @o3r/schematics' .`);
      throw (e);
    }
  };


}

