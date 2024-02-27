import { chain } from '@angular-devkit/schematics';
import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { createSchematicWithMetricsIfInstalled } from '@o3r/schematics';
import * as path from 'node:path';
import { updateCmsAdapter } from '../cms-adapter';
import type { NgAddSchematicsSchema } from './schema';

/**
 * Add Otter extractors to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    try {
      const { getPackageInstallConfig, getProjectNewDependenciesTypes, setupDependencies, getO3rPeerDeps, getWorkspaceConfig } = await import('@o3r/schematics');
      const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
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
      }, getPackageInstallConfig(packageJsonPath, tree, options.projectName, true));
      return chain([
        setupDependencies({
          projectName: options.projectName,
          dependencies,
          ngAddToRun: depsInfo.o3rPeerDeps
        }),
        updateCmsAdapter(options, __dirname)
      ]);
    } catch (e) {
      // o3r extractors needs o3r/core as peer dep. o3r/core will install o3r/schematics
      context.logger.error(`[ERROR]: Adding @o3r/extractors has failed.
      If the error is related to missing @o3r dependencies you need to install '@o3r/core' to be able to use the localization package. Please run 'ng add @o3r/core' .
      Otherwise, use the error message as guidance.`);
      throw (e);
    }
  };
}

/**
 * Add Otter extractors to an Angular Project
 * @param options
 */
export const ngAdd = createSchematicWithMetricsIfInstalled(ngAddFn);
