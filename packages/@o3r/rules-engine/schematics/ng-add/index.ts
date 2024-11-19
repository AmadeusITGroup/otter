import { chain, type Rule } from '@angular-devkit/schematics';
import { addRootImport } from '@schematics/angular/utility';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as ts from 'typescript';
import { updateCmsAdapter } from '../cms-adapter';
import { registerDevtools } from './helpers/devtools-registration';
import type { NgAddSchematicsSchema } from './schema';
import { isImported } from '@schematics/angular/utility/ast-utils';
import {
  createSchematicWithMetricsIfInstalled,
  getAppModuleFilePath,
  getDefaultOptionsForSchematic,
  getExternalDependenciesVersionRange,
  getO3rPeerDeps,
  getPackageInstallConfig,
  getProjectNewDependenciesTypes,
  getWorkspaceConfig,
  registerPackageCollectionSchematics,
  removePackages,
  setupDependencies,
  setupSchematicsParamsForProject
} from '@o3r/schematics';

const devDependenciesToInstall = [
  'jsonpath-plus'
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
    ({code, external}) => code`\n${external('RulesEngineRunnerModule', '@o3r/rules-engine')}.forRoot()`
  );
};

/**
 * Add Otter rules-engine to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return (tree, context) => {
    options = {...getDefaultOptionsForSchematic(getWorkspaceConfig(tree), '@o3r/rules-engine', 'ng-add', options), ...options};
    const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf8' }));
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
            types: getProjectNewDependenciesTypes(workspaceProject)
          }]
        };
      });
    const rule = chain([
      registerPackageCollectionSchematics(packageJson),
      setupSchematicsParamsForProject({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '@o3r/core:component': {
          useRulesEngine: undefined
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '@o3r/core:component-container': {
          useRulesEngine: undefined
        }
      }, options.projectName),
      removePackages(['@otter/rules-engine', '@otter/rules-engine-core']),
      setupDependencies({
        projectName: options.projectName,
        dependencies,
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
export const ngAdd = (options: NgAddSchematicsSchema): Rule => createSchematicWithMetricsIfInstalled(ngAddFn)(options);
