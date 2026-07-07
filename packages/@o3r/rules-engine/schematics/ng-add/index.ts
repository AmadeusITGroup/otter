import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  chain,
  type Rule,
} from '@angular-devkit/schematics';
import {
  createOtterSchematic,
  getAppModuleFilePath,
  ngAddDependenciesRule,
  registerPackageCollectionSchematics,
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
  '@angular/platform-browser-dynamic',
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

const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf8' })) as PackageJson;

/**
 * Add Otter rules-engine to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  const schematicsDefaultOptions = {
    useRulesEngine: undefined
  };
  /* ng add rules */
  return chain([
    (_, context) => {
      context.logger.info(`The package @o3r/rules-engine comes with a debug mechanism`);
      context.logger.info('Get information on https://github.com/AmadeusITGroup/otter/tree/main/docs/rules-engine/how-to-use/debug.md');
    },
    registerPackageCollectionSchematics(packageJson),
    setupSchematicsParamsForProject({
      '@o3r/core:component': schematicsDefaultOptions,
      '@o3r/core:component-container': schematicsDefaultOptions
    }, options.projectName),
    ngAddDependenciesRule(options, packageJsonPath, {
      dependenciesToInstall,
      devDependenciesToInstall,
      additionalNgAddToRun: options.enableMetadataExtract ? ['@o3r/extractors'] : undefined
    }),
    ...(options.enableMetadataExtract ? [updateCmsAdapter(options)] : []),
    registerDevtools(options),
    updateAppModuleOrAppConfig(options.projectName)
  ]);
}

/**
 * Add Otter rules-engine to an Angular Project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema) => createOtterSchematic(ngAddFn)(options);
