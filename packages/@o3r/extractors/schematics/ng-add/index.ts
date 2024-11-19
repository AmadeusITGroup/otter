import { chain } from '@angular-devkit/schematics';
import type { Rule } from '@angular-devkit/schematics';
import * as path from 'node:path';
import { updateCmsAdapter } from '../cms-adapter';
import type { NgAddSchematicsSchema } from './schema';
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

const dependenciesToInstall = [
  'semver'
];

/**
 * Add Otter extractors to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  return async (tree, context) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { NodeDependencyType } = await import('@schematics/angular/utility/dependencies').catch(() => ({ NodeDependencyType: { Dev: 'devDependencies' as NodeDependencyType.Dev } }));
    const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
    const depsInfo = getO3rPeerDeps(packageJsonPath);
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    const dependencies = depsInfo.o3rPeerDeps.reduce((acc, dep) => {
      acc[dep] = {
        inManifest: [{
          range: `${options.exactO3rVersion ? '' : '~'}${depsInfo.packageVersion}`,
          types: getProjectNewDependenciesTypes(workspaceProject)
        }],
        ngAddOptions: { exactO3rVersion: options.exactO3rVersion }
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
    return chain([
      setupDependencies({
        projectName: options.projectName,
        dependencies,
        ngAddToRun: depsInfo.o3rPeerDeps
      }),
      updateCmsAdapter(options, __dirname)
    ]);
  };
}

/**
 * Add Otter extractors to an Angular Project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema): Rule => createSchematicWithMetricsIfInstalled(ngAddFn)(options);
