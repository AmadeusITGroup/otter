import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  chain,
  noop,
  Rule,
} from '@angular-devkit/schematics';
import {
  applyEsLintFix,
  createOtterSchematic,
  ngAddDependenciesRule,
  registerPackageCollectionSchematics,
  setupSchematicsParamsForProject,
} from '@o3r/schematics';
import type {
  PackageJson,
} from 'type-fest';
import {
  updateCmsAdapter,
} from '../cms-adapter';
import {
  updateI18n,
  updateLocalization,
} from '../localization-base';
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
  '@angular/platform-browser-dynamic',
  '@formatjs/intl-numberformat',
  '@ngrx/store',
  '@ngx-translate/core',
  'intl-messageformat',
  'rxjs'
];

/**
 * List of external dependencies to be added to the project as dev dependencies
 */
const devDependenciesToInstall = [
  '@angular-devkit/core',
  'chokidar',
  'globby'
];

const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf8' })) as PackageJson;

/**
 * Add Otter localization to an Angular Project
 * @param options for the dependencies installations
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  return chain([
    (_, context) => {
      context.logger.info(`The package @o3r/localization comes with a debug mechanism`);
      context.logger.info('Get information on https://github.com/AmadeusITGroup/otter/tree/main/docs/localization/LOCALIZATION.md#Debugging');
    },
    updateLocalization(options, __dirname),
    updateI18n(options),
    options.skipLinter ? noop() : applyEsLintFix(),
    ngAddDependenciesRule(options, packageJsonPath, { dependenciesToInstall, devDependenciesToInstall }),
    updateCmsAdapter(options),
    registerPackageCollectionSchematics(packageJson),
    setupSchematicsParamsForProject({ '@o3r/core:component*': { useLocalization: true } }, options.projectName),
    registerDevtools(options)
  ]);
}

/**
 * Add Otter localization to an Angular Project
 * @param options for the dependencies installations
 */
export const ngAdd = (options: NgAddSchematicsSchema) => createOtterSchematic(ngAddFn)(options);
