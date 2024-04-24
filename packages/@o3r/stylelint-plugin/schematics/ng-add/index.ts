import type { Rule } from '@angular-devkit/schematics';
import { createSchematicWithMetricsIfInstalled, getPackageInstallConfig, setupDependencies } from '@o3r/schematics';
import type { NgAddSchematicsSchema } from './schema';
import * as path from 'node:path';

const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
const dependenciesToInstall = [
  'postcss',
  'postcss-scss',
  'stylelint'
];

/**
 * Add Otter stylelint-plugin to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return async (tree) => {
    const {
      getExternalDependenciesVersionRange,
      getProjectNewDependenciesTypes,
      getO3rPeerDeps,
      getWorkspaceConfig
    } = await import('@o3r/schematics');
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { NodeDependencyType } = await import('@schematics/angular/utility/dependencies');
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
    Object.entries(getExternalDependenciesVersionRange(dependenciesToInstall, packageJsonPath)).forEach(([dep, range]) => {
      dependencies[dep] = {
        inManifest: [{
          range,
          types: [NodeDependencyType.Dev]
        }]
      };
    });
    return setupDependencies({
      projectName: options.projectName,
      dependencies
    });
  };
}

/**
 * Add Otter stylelint-plugin to an Angular Project
 */
export const ngAdd = createSchematicWithMetricsIfInstalled(ngAddFn);
