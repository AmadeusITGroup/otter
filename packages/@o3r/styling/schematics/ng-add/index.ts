import { chain, Rule } from '@angular-devkit/schematics';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { updateCmsAdapter } from '../cms-adapter';
import type { NgAddSchematicsSchema } from './schema';

const devDependenciesToInstall = [
  'chokidar',
  'sass-loader'
];

const dependenciesToInstall = [
  '@angular/material',
  '@angular/cdk'
];


const reportMissingSchematicsDep = (logger: { error: (message: string) => any }) => (reason: any) => {
  logger.error(`[ERROR]: Adding @o3r/styling has failed.
If the error is related to missing @o3r dependencies you need to install '@o3r/core' to be able to use the styling package. Please run 'ng add @o3r/core' .
Otherwise, use the error message as guidance.`);
  throw reason;
};

/**
 * Add Otter styling to an Angular Project
 * Update the styling if the app/lib used otter v7
 * @param options for the dependency installations
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  return async (tree) => {
    const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
    const {
      getDefaultOptionsForSchematic,
      getPackageInstallConfig,
      getO3rPeerDeps,
      getProjectNewDependenciesTypes,
      getWorkspaceConfig,
      setupDependencies,
      removePackages,
      registerPackageCollectionSchematics,
      setupSchematicsDefaultParams,
      updateSassImports,
      getExternalDependenciesVersionRange
    } = await import('@o3r/schematics');
    options = {...getDefaultOptionsForSchematic(getWorkspaceConfig(tree), '@o3r/styling', 'ng-add', options), ...options};
    const {updateThemeFiles, removeV7OtterAssetsInAngularJson} = await import('./theme-files');
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const {NodeDependencyType} = await import('@schematics/angular/utility/dependencies');
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
    Object.entries(getExternalDependenciesVersionRange(devDependenciesToInstall, packageJsonPath))
      .forEach(([dep, range]) => {
        dependencies[dep] = {
          inManifest: [{
            range,
            types: [NodeDependencyType.Dev]
          }]
        };
      });
    Object.entries(getExternalDependenciesVersionRange(dependenciesToInstall, packageJsonPath))
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
      setupSchematicsDefaultParams({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '@o3r/core:component': {
          useOtterTheming: undefined
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '@o3r/core:component-presenter': {
          useOtterTheming: undefined
        }
      }),
      ...(options.enableMetadataExtract ? [updateCmsAdapter(options)] : [])
    ]);
  };
}

/**
 * Add Otter styling to an Angular Project
 * Update the styling if the app/lib used otter v7
 * @param options for the dependency installations
 */
export const ngAdd = (options: NgAddSchematicsSchema): Rule => async (_, { logger }) => {
  const { createSchematicWithMetricsIfInstalled } = await import('@o3r/schematics').catch(reportMissingSchematicsDep(logger));
  return createSchematicWithMetricsIfInstalled(ngAddFn)(options);
};
