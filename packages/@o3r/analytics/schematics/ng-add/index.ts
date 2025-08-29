import * as path from 'node:path';
import {
  chain,
  type Rule,
} from '@angular-devkit/schematics';
import {
  createOtterSchematic,
  ngAddDependenciesRule,
} from '@o3r/schematics';
import type {
  NgAddSchematicsSchema,
} from './schema';

const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');

/**
 * List of external dependencies to be added to the project as peer dependencies
 */
const dependenciesToInstall = [
  '@angular/common',
  '@angular/core',
  '@angular/router',
  '@angular/platform-browser',
  '@angular/platform-browser-dynamic',
  '@ngrx/store',
  'rxjs'
];

/**
 * List of external dependencies to be added to the project as dev dependencies
 */
const devDependenciesToInstall: string[] = [
];

/**
 * Add Otter analytics to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return chain([
    ngAddDependenciesRule(options, packageJsonPath, { dependenciesToInstall, devDependenciesToInstall })
  ]);
}

export const ngAdd = (options: NgAddSchematicsSchema) => createOtterSchematic(ngAddFn)(options);
