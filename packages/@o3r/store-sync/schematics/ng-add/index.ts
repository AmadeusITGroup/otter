import * as path from 'node:path';
import {
  chain,
  noop,
  Rule,
} from '@angular-devkit/schematics';
import {
  applyEsLintFix,
  createOtterSchematic,
  getExternalDependenciesVersionRange,
  getO3rPeerDeps,
  getPackageInstallConfig,
  getProjectNewDependenciesTypes,
  getWorkspaceConfig,
  setupDependencies,
} from '@o3r/schematics';
import {
  NodeDependencyType,
} from '@schematics/angular/utility/dependencies';
import type {
  NgAddSchematicsSchema,
} from './schema';

const devDependenciesToInstall = [
  'fast-deep-equal'
];

/**
 * Add Otter store-sync to an Otter Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  return (tree, context) => {
    // use dynamic import to properly raise an exception if it is not an Otter project.

    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
    const depsInfo = getO3rPeerDeps(packageJsonPath);

    const dependencies = depsInfo.o3rPeerDeps.reduce((acc, dep) => {
      acc[dep] = {
        inManifest: [{
          range: `${options.exactO3rVersion ? '' : '~'}${depsInfo.packageVersion}`,
          types: getProjectNewDependenciesTypes(workspaceProject)
        }],
        ngAddOptions: { exactO3rVersion: options.exactO3rVersion }
      };
      return acc;
    }, getPackageInstallConfig(packageJsonPath, tree, options.projectName, false, !!options.exactO3rVersion));
    Object.entries(getExternalDependenciesVersionRange(devDependenciesToInstall, packageJsonPath, context.logger))
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
  };
}

/**
 * Add Otter store-sync to an Otter Project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema) => createOtterSchematic(ngAddFn)(options);
