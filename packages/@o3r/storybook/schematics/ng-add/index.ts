import { chain, noop, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { createSchematicWithMetricsIfInstalled } from '@o3r/schematics';
import * as path from 'node:path';
import type { NgAddSchematicsSchema } from './schema';

const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');

/**
 * Add Otter storybook to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    try {
      const { applyEsLintFix, getPackageInstallConfig, setupDependencies, getO3rPeerDeps, getProjectNewDependenciesTypes, getWorkspaceConfig, removePackages } = await import('@o3r/schematics');
      const { updateStorybook } = await import('../storybook-base');
      const depsInfo = getO3rPeerDeps(packageJsonPath);
      const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
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
        removePackages(['@otter/storybook']),
        updateStorybook(options, __dirname),
        options.skipLinter ? noop() : applyEsLintFix(),
        setupDependencies({
          projectName: options.projectName,
          dependencies,
          ngAddToRun: depsInfo.o3rPeerDeps
        })
      ])(tree, context);
    } catch (e) {
      // storybook needs o3r/core as peer dep. o3r/core will install o3r/schematics
      context.logger.error(`[ERROR]: Adding @o3r/storybook has failed.
      If the error is related to missing @o3r dependencies you need to install '@o3r/core' to be able to use the storybook package. Please run 'ng add @o3r/core' .
      Otherwise, use the error message as guidance.`);
      throw (e);
    }
  };
}

/**
 * Add Otter storybook to an Angular Project
 * @param options
 */
export const ngAdd = createSchematicWithMetricsIfInstalled(ngAddFn);
