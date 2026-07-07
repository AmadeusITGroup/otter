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
} from '@o3r/schematics';
import type {
  NgAddSchematicsSchema,
} from './schema';

const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');

const doCustomAction = (_options: NgAddSchematicsSchema): Rule => (tree) => {
  // your custom code here
  return tree;
};

/**
 * List of external dependencies to be added to the project as dev dependencies
 */
const devDependenciesToInstall: string[] = [];

/**
 * List of external dependencies to be added to the project as peer dependencies
 */
const dependenciesToInstall: string[] = [
  '@angular/common',
  '@angular/core',
  '@angular/router'
];

/**
 * Add ama mfe angular utils library
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  return chain([
    doCustomAction(options),
    options.skipLinter ? noop() : applyEsLintFix(),
    ngAddDependenciesRule(options, packageJsonPath, { dependenciesToInstall, devDependenciesToInstall })
  ]);
}

/**
 * Add module to an Angular Project
 * @param options ng add options
 */
export const ngAdd = (options: NgAddSchematicsSchema) => createOtterSchematic(ngAddFn)(options);
