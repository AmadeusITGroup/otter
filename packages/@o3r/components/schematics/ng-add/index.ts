import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  chain,
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import {
  createOtterSchematic,
  getDefaultOptionsForSchematic,
  getExternalDependenciesInfo,
  getO3rPeerDeps,
  getPackageInstallConfig,
  getProjectNewDependenciesTypes,
  getWorkspaceConfig,
  registerPackageCollectionSchematics,
  removePackages,
  setupDependencies,
  setupSchematicsParamsForProject,
} from '@o3r/schematics';
import {
  PackageJson,
} from 'type-fest';
import {
  updateCmsAdapter,
} from '../cms-adapter';
import {
  registerDevtools,
} from './helpers/devtools-registration';
import type {
  NgAddSchematicsSchema,
} from './schema';

/**
 * List of external dependencies to be added to the project as peer dependencies
 */
const dependenciesToInstall = [
  '@angular/cdk',
  '@angular/common',
  '@angular/core',
  '@angular/forms',
  '@angular/platform-browser',
  '@angular/platform-browser-dynamic',
  '@ngrx/effects',
  '@ngrx/entity',
  '@ngrx/store',
  'rxjs'
];

/**
 * List of external dependencies to be added to the project as dev dependencies
 */
const devDependenciesToInstall = [
  'chokidar'
];

/**
 * Add Otter components to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return (tree: Tree, context: SchematicContext) => {
    options = { ...getDefaultOptionsForSchematic(getWorkspaceConfig(tree), '@o3r/components', 'ng-add', options), ...options };
    const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
    const o3rPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf8' })) as PackageJson;
    const o3rPeerDeps = getO3rPeerDeps(packageJsonPath);
    if (options.enableMetadataExtract) {
      o3rPeerDeps.o3rPeerDeps = [...o3rPeerDeps.o3rPeerDeps, '@o3r/extractors'];
    }

    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    const dependencies = o3rPeerDeps.o3rPeerDeps.reduce((acc, dep) => {
      acc[dep] = {
        inManifest: [{
          range: `${options.exactO3rVersion ? '' : '~'}${o3rPeerDeps.packageVersion}`,
          types: getProjectNewDependenciesTypes(workspaceProject)
        }],
        ngAddOptions: { exactO3rVersion: options.exactO3rVersion }
      };
      return acc;
    }, getPackageInstallConfig(packageJsonPath, tree, options.projectName, false, !!options.exactO3rVersion));

    const projectDirectory = workspaceProject?.root || '.';
    const projectPackageJson = tree.readJson(path.posix.join(projectDirectory, 'package.json')) as PackageJson;
    const externalDependenciesInfo = getExternalDependenciesInfo({
      devDependenciesToInstall,
      dependenciesToInstall,
      projectPackageJson,
      o3rPackageJsonPath: packageJsonPath,
      projectType: workspaceProject?.projectType
    },
    context.logger
    );
    const rule = chain([
      removePackages(['@otter/components']),
      setupDependencies({
        projectName: options.projectName,
        dependencies: {
          ...dependencies,
          ...externalDependenciesInfo
        },
        ngAddToRun: o3rPeerDeps.o3rPeerDeps
      }),
      registerPackageCollectionSchematics(o3rPackageJson),
      setupSchematicsParamsForProject({
        '@o3r/core:component': {},
        '@o3r/core:component-container': {},
        '@o3r/core:component-presenter': {}
      }, options.projectName),
      ...(options.enableMetadataExtract ? [updateCmsAdapter(options)] : []),
      registerDevtools(options)
    ]);

    context.logger.info(`The package ${o3rPeerDeps.packageName!} comes with a debug mechanism`);
    context.logger.info('Get more information on the following page: https://github.com/AmadeusITGroup/otter/tree/main/docs/components/INTRODUCTION.md#Runtime-debugging');

    return () => rule(tree, context);
  };
}

/**
 * Add Otter components to an Angular Project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema) => createOtterSchematic(ngAddFn)(options);
