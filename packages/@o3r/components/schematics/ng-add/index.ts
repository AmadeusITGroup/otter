import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import {
  createOtterSchematic,
  ngAddDependenciesRule,
  registerPackageCollectionSchematics,
  removePackages,
  setupSchematicsParamsForProject,
} from '@o3r/schematics';
import type {
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

const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');

/**
 * Add Otter components to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  const o3rPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf8' })) as PackageJson;
  /* ng add rules */
  return chain([
    (_, context) => {
      context.logger.info(`The package @o3r/components comes with a debug mechanism`);
      context.logger.info('Get more information on the following page: https://github.com/AmadeusITGroup/otter/tree/main/docs/components/INTRODUCTION.md#Runtime-debugging');
    },
    removePackages(['@otter/components']),
    ngAddDependenciesRule(options, packageJsonPath, {
      dependenciesToInstall,
      devDependenciesToInstall,
      additionalNgAddToRun: options.enableMetadataExtract ? ['@o3r/extractors'] : undefined
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
}

/**
 * Add Otter components to an Angular Project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema) => createOtterSchematic(ngAddFn)(options);
