import { chain, noop, Rule } from '@angular-devkit/schematics';
import { createSchematicWithMetricsIfInstalled } from '@o3r/schematics';
import type { NgAddSchematicsSchema } from './schema';
import * as path from 'node:path';
import { NodeDependencyType } from '@schematics/angular/utility/dependencies';

const devDependenciesToInstall = [
  'fast-deep-equal'
];

/**
 * Add Otter store-sync to an Otter Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  return async (tree, context) => {
    try {
      // use dynamic import to properly raise an exception if it is not an Otter project.
      const {
        getPackageInstallConfig,
        applyEsLintFix,
        setupDependencies,
        getO3rPeerDeps,
        getProjectNewDependenciesTypes,
        getWorkspaceConfig,
        getExternalDependenciesVersionRange
      } = await import('@o3r/schematics');

      const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
      const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
      const depsInfo = getO3rPeerDeps(packageJsonPath);

      const dependencies = depsInfo.o3rPeerDeps.reduce((acc, dep) => {
        acc[dep] = {
          inManifest: [{
            range: `~${depsInfo.packageVersion}`,
            types: getProjectNewDependenciesTypes(workspaceProject)
          }]
        };
        return acc;
      }, getPackageInstallConfig(packageJsonPath, tree, options.projectName));
      Object.entries(getExternalDependenciesVersionRange(devDependenciesToInstall, packageJsonPath))
        .forEach(([dep, range]) => {
          dependencies[dep] = {
            inManifest: [{
              range,
              types: [NodeDependencyType.Dev]
            }]
          };
        });

      return chain([
        // optional custom action dedicated to this module
        options.skipLinter ? noop() : applyEsLintFix(),
        // add the missing Otter modules in the current project
        setupDependencies({
          projectName: options.projectName,
          dependencies,
          ngAddToRun: depsInfo.o3rPeerDeps
        })
      ]);
    } catch (e) {
      // If the installation is initialized in a non-Otter application, mandatory packages will be missing. We need to notify the user
      context.logger.error(`[ERROR]: Adding store-sync has failed.
      If the error is related to missing @o3r dependencies you need to install '@o3r/core' to be able to use the store-sync package. Please run 'ng add @o3r/core' .
      Otherwise, use the error message as guidance.`);
      throw (e);
    }
  };
}

/**
 * Add Otter store-sync to an Otter Project
 * @param options
 */
export const ngAdd = createSchematicWithMetricsIfInstalled(ngAddFn);
