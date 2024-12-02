import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  chain,
  type Rule,
} from '@angular-devkit/schematics';
import {
  addRootImport,
} from '@schematics/angular/utility';
import {
  isImported,
} from '@schematics/angular/utility/ast-utils';
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

const devDependenciesToInstall = [
  'jsonpath-plus'
];

const reportMissingSchematicsDep = (logger: { error: (message: string) => any }) => (reason: any) => {
  logger.error(`[ERROR]: Adding @o3r/rules-engine has failed.
If the error is related to missing @o3r dependencies you need to install '@o3r/core' to be able to use the rules-engine package. Please run 'ng add @o3r/core' .
Otherwise, use the error message as guidance.`);
  throw reason;
};

const updateAppModuleOrAppConfig = (projectName: string | undefined): Rule => async (tree, context) => {
  const {
    getAppModuleFilePath
  } = await import('@o3r/schematics');
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
  return async (tree, context) => {
    const {
      setupDependencies,
      getPackageInstallConfig,
      getDefaultOptionsForSchematic,
      getO3rPeerDeps,
      getProjectNewDependenciesTypes,
      getWorkspaceConfig,
      getExternalDependenciesVersionRange,
      removePackages,
      setupSchematicsParamsForProject,
      registerPackageCollectionSchematics
    } = await import('@o3r/schematics');
    options = { ...getDefaultOptionsForSchematic(getWorkspaceConfig(tree), '@o3r/rules-engine', 'ng-add', options), ...options };
    const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf8' }));
    const depsInfo = getO3rPeerDeps(packageJsonPath);
    if (options.enableMetadataExtract) {
      depsInfo.o3rPeerDeps = [...depsInfo.o3rPeerDeps, '@o3r/extractors'];
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
            types: getProjectNewDependenciesTypes(workspaceProject)
          }]
        };
      });
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
        dependencies,
        ngAddToRun: depsInfo.o3rPeerDeps
      }),
      ...(options.enableMetadataExtract ? [updateCmsAdapter(options)] : []),
      await registerDevtools(options),
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
export const ngAdd = (options: NgAddSchematicsSchema): Rule => async (_, { logger }) => {
  const { createSchematicWithMetricsIfInstalled } = await import('@o3r/schematics').catch(reportMissingSchematicsDep(logger));
  return createSchematicWithMetricsIfInstalled(ngAddFn)(options);
};
