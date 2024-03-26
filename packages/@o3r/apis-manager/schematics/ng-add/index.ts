import { chain, noop, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { createSchematicWithMetricsIfInstalled, getPackageInstallConfig } from '@o3r/schematics';
import * as path from 'node:path';
import type { NgAddSchematicsSchema } from './schema';

/**
 * Add Otter apis manager to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    try {
      const { setupDependencies, getO3rPeerDeps, applyEsLintFix, getWorkspaceConfig, getProjectNewDependenciesTypes } = await import('@o3r/schematics');
      const { updateApiDependencies } = await import('../helpers/update-api-deps');
      const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
      const depsInfo = getO3rPeerDeps(packageJsonPath);
      const rulesToExecute: Rule[] = [];
      const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
      const projectType = workspaceProject?.projectType || 'application';
      if (projectType === 'application') {
        rulesToExecute.push(updateApiDependencies(options));
      }

      const dependencies = depsInfo.o3rPeerDeps.reduce((acc, dep) => {
        acc[dep] = {
          inManifest: [{
            range: `~${depsInfo.packageVersion}`,
            types: getProjectNewDependenciesTypes(workspaceProject)
          }]
        };
        return acc;
      }, getPackageInstallConfig(packageJsonPath, tree, options.projectName));

      return () => chain([
        ...rulesToExecute,
        options.skipLinter ? noop : applyEsLintFix(),
        setupDependencies({
          projectName: options.projectName,
          dependencies,
          ngAddToRun: depsInfo.o3rPeerDeps
        })
      ])(tree, context);

    } catch (e) {
      // o3r apis-manager needs o3r/schematics as peer dep.
      context.logger.error(`[ERROR]: Adding @o3r/apis-manager has failed.
      You need to install '@o3r/schematics' to be able to use the o3r apis-manager package. Please run 'ng add @o3r/schematics' .`);
      throw (e);
    }
  };


}

/**
 * Add Otter apis manager to an Angular Project
 * @param options
 */
export const ngAdd = createSchematicWithMetricsIfInstalled(ngAddFn);
