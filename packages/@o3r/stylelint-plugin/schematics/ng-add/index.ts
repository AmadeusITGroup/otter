import type { Rule } from '@angular-devkit/schematics';
import type { NgAddSchematicsSchema } from './schema';
import * as path from 'node:path';
import type { NodeDependencyType } from '@schematics/angular/utility/dependencies';
import {
  createSchematicWithMetricsIfInstalled,
  getExternalDependenciesVersionRange,
  getO3rPeerDeps,
  getPackageInstallConfig,
  getProjectNewDependenciesTypes,
  getWorkspaceConfig,
  setupDependencies
} from '@o3r/schematics';

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
  return async (tree, context) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { NodeDependencyType } = await import('@schematics/angular/utility/dependencies').catch(() => ({ NodeDependencyType: { Dev: 'devDependencies' as NodeDependencyType.Dev } }));
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
    }, getPackageInstallConfig(packageJsonPath, tree, options.projectName, true, !!options.exactO3rVersion));
    Object.entries(getExternalDependenciesVersionRange(dependenciesToInstall, packageJsonPath, context.logger)).forEach(([dep, range]) => {
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
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema): Rule => createSchematicWithMetricsIfInstalled(ngAddFn)(options);
