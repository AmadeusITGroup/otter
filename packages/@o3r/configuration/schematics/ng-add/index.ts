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
  setupSchematicsParamsForProject,
} from '@o3r/schematics';
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
  '@angular/core',
  '@angular/platform-browser-dynamic',
  '@ngrx/entity',
  '@ngrx/store',
  'rxjs'
];

/**
 * List of external dependencies to be added to the project as dev dependencies
 */
const devDependenciesToInstall = [
  'rxjs'
];

/**
 * Add Otter configuration to an Angular Project
 * @param options The options to pass to ng-add execution
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf8' }));
  const schematicsDefaultOptions = { useOtterConfig: undefined };

  return () => chain([
    (_, context) => {
      context.logger.info(`The package @o3r/configuration comes with a debug mechanism`);
      context.logger.info('Get more information on the following page: https://github.com/AmadeusITGroup/otter/tree/main/docs/configuration/OVERVIEW.md#Runtime-debugging');
    },
    registerPackageCollectionSchematics(packageJson),
    setupSchematicsParamsForProject({
      '@o3r/core:component': schematicsDefaultOptions,
      '@o3r/core:component-container': schematicsDefaultOptions,
      '@o3r/core:component-presenter': schematicsDefaultOptions
    }, options.projectName),
    ngAddDependenciesRule(options, packageJsonPath, { dependenciesToInstall, devDependenciesToInstall }),
    () => registerDevtools(options)
  ]);
}

/**
 * Add Otter configuration to an Angular Project
 * @param options The options to pass to ng-add execution
 */
export const ngAdd = (options: NgAddSchematicsSchema) => createOtterSchematic(ngAddFn)(options);
