import { chain, Rule } from '@angular-devkit/schematics';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { updateCmsAdapter } from '../cms-adapter';
import type { NgAddSchematicsSchema } from './schema';
import type { NodeDependencyType } from '@schematics/angular/utility/dependencies';
import {
  createSchematicWithMetricsIfInstalled,
  getDefaultOptionsForSchematic,
  getExternalDependenciesVersionRange,
  getO3rPeerDeps,
  getPackageInstallConfig,
  getProjectNewDependenciesTypes,
  getWorkspaceConfig,
  registerPackageCollectionSchematics,
  removePackages,
  setupDependencies,
  setupSchematicsParamsForProject,
  updateSassImports
} from '@o3r/schematics';

const devDependenciesToInstall = [
  'chokidar',
  'sass-loader'
];

const dependenciesToInstall = [
  '@angular/material',
  '@angular/cdk'
];

/**
 * Add Otter styling to an Angular Project
 * Update the styling if the app/lib used otter v7
 * @param options for the dependency installations
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  return async (tree, context) => {
    const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
    options = {...getDefaultOptionsForSchematic(getWorkspaceConfig(tree), '@o3r/styling', 'ng-add', options), ...options};
    const {updateThemeFiles, removeV7OtterAssetsInAngularJson} = await import('./theme-files');
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { NodeDependencyType } = await import('@schematics/angular/utility/dependencies').catch(() => ({ NodeDependencyType: { Dev: 'devDependencies' as NodeDependencyType.Dev } }));
    const depsInfo = getO3rPeerDeps(packageJsonPath);
    if (options.enableMetadataExtract) {
      depsInfo.o3rPeerDeps = [...depsInfo.o3rPeerDeps , '@o3r/extractors'];
    }
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
    Object.entries(getExternalDependenciesVersionRange(dependenciesToInstall, packageJsonPath, context.logger))
      .forEach(([dep, range]) => {
        dependencies[dep] = {
          inManifest: [{
            range,
            types: getProjectNewDependenciesTypes(workspaceProject)
          }]
        };
      });
    return chain([
      removePackages(['@otter/styling']),
      updateSassImports('o3r'),
      updateThemeFiles(__dirname, options),
      removeV7OtterAssetsInAngularJson(options),
      setupDependencies({
        projectName: options.projectName,
        dependencies,
        ngAddToRun: depsInfo.o3rPeerDeps
      }),
      registerPackageCollectionSchematics(JSON.parse(fs.readFileSync(packageJsonPath).toString())),
      setupSchematicsParamsForProject({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '@o3r/core:component': {
          useOtterTheming: undefined
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '@o3r/core:component-presenter': {
          useOtterTheming: undefined
        }
      }, options.projectName),
      ...(options.enableMetadataExtract ? [updateCmsAdapter(options)] : [])
    ]);
  };
}

/**
 * Add Otter styling to an Angular Project
 * Update the styling if the app/lib used otter v7
 * @param options for the dependency installations
 */
export const ngAdd = (options: NgAddSchematicsSchema): Rule => createSchematicWithMetricsIfInstalled(ngAddFn)(options);
