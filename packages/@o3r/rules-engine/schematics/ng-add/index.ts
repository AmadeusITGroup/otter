import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  chain,
  type Rule,
} from '@angular-devkit/schematics';
import {
  createOtterSchematic,
  getAppModuleFilePath,
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
  addRootImport,
} from '@schematics/angular/utility';
import {
  isImported,
} from '@schematics/angular/utility/ast-utils';
import {
  type PackageJson,
} from 'type-fest';
import * as ts from 'typescript';
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
  '@angular/common',
  '@angular/core',
  '@angular/forms',
  '@ngrx/effects',
  '@ngrx/entity',
  '@ngrx/store',
  '@ngx-translate/core',
  'jsonpath-plus',
  'rxjs'
];

/**
 * List of external dependencies to be added to the project as dev dependencies
 */
const devDependenciesToInstall = [
  '@angular-devkit/architect'
];

const updateAppModuleOrAppConfig = (projectName: string | undefined): Rule => (tree, context) => {
  const moduleFilePath = getAppModuleFilePath(tree, context, projectName);
  if (!moduleFilePath) {
    return () => tree;
  }

  const sourceFileContent = tree.readText(moduleFilePath);
  const sourceFile = ts.createSourceFile(
    moduleFilePath,
    sourceFileContent,
    ts.ScriptTarget.ES2015,
    true
  );

  if (isImported(sourceFile, 'RulesEngineRunnerModule', '@o3r/rules-engine')) {
    return () => tree;
  }

  return addRootImport(
    projectName!,
    ({ code, external }) => code`\n${external('RulesEngineRunnerModule', '@o3r/rules-engine')}.forRoot()`
  );
};

/**
 * Add Otter rules-engine to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return (tree, context) => {
    options = { ...getDefaultOptionsForSchematic(getWorkspaceConfig(tree), '@o3r/rules-engine', 'ng-add', options), ...options };
    const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf8' })) as PackageJson;
    const depsInfo = getO3rPeerDeps(packageJsonPath);
    if (options.enableMetadataExtract) {
      depsInfo.o3rPeerDeps = [...depsInfo.o3rPeerDeps, '@o3r/extractors'];
    }
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    const projectDirectory = workspaceProject?.root || '.';
    const projectPackageJson = tree.readJson(path.posix.join(projectDirectory, 'package.json')) as PackageJson;

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
    const externalDependenciesInfo = getExternalDependenciesInfo({
      devDependenciesToInstall,
      dependenciesToInstall,
      projectType: workspaceProject?.projectType,
      projectPackageJson,
      o3rPackageJsonPath: packageJsonPath
    },
    context.logger
    );

    const schematicsDefaultOptions = {
      useRulesEngine: undefined
    };
    const rule = chain([
      registerPackageCollectionSchematics(packageJson),
      setupSchematicsParamsForProject({
        '@o3r/core:component': schematicsDefaultOptions,
        '@o3r/core:component-container': schematicsDefaultOptions
      }, options.projectName),
      removePackages(['@otter/rules-engine', '@otter/rules-engine-core']),
      setupDependencies({
        projectName: options.projectName,
        dependencies: {
          ...dependencies,
          ...externalDependenciesInfo
        },
        ngAddToRun: depsInfo.o3rPeerDeps
      }),
      ...(options.enableMetadataExtract ? [updateCmsAdapter(options)] : []),
      registerDevtools(options),
      updateAppModuleOrAppConfig(options.projectName)
    ]);

    context.logger.info(`The package ${depsInfo.packageName!} comes with a debug mechanism`);
    context.logger.info('Get information on https://github.com/AmadeusITGroup/otter/tree/main/docs/rules-engine/how-to-use/debug.md');

    return rule;
  };
}

/**
 * Add Otter rules-engine to an Angular Project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema) => createOtterSchematic(ngAddFn)(options);
