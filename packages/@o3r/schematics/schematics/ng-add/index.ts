import * as path from 'node:path';
import type {
  Rule,
} from '@angular-devkit/schematics';
import {
  createOtterSchematic,
  ngAddDependenciesRule,
} from '../../src/public_api';
import type {
  NgAddSchematicsSchema,
} from './schema';

/**
 * List of external dependencies to be added to the project as peer dependencies
 */
const dependenciesToInstall: string[] = [];

/**
 * List of external dependencies to be added to the project as dev dependencies
 */
const devDependenciesToInstall = [
  '@angular-devkit/architect',
  '@angular-devkit/core',
  '@angular-devkit/schematics',
  '@schematics/angular',
  'globby',
  'rxjs'
];

/**
 * Add Otter schematics to an Angular Project
 * @param options schematics options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
  return ngAddDependenciesRule({
    ...options,
    skipInstall: false
  }, packageJsonPath, { dependenciesToInstall, devDependenciesToInstall });
}

/**
 * Add Otter schematics to an Angular Project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema) => createOtterSchematic(ngAddFn)(options);
