import * as path from 'node:path';
import {
  chain,
  Rule,
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
  '@capacitor/browser',
  '@capacitor/core',
  '@capacitor/device',
  '@capacitor/preferences',
  '@ngrx/store',
  'fast-deep-equal',
  'rxjs'
];

/**
 * List of external dependencies to be added to the project as dev dependencies
 */
const devDependenciesToInstall: string[] = [

] satisfies { name: string; enforceTildeRange?: boolean; requireInstall?: boolean }[];

/**
 * Add Otter mobile to an Angular Project
 * @param options ng add options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return chain([
    ngAddDependenciesRule(options, packageJsonPath, { dependenciesToInstall, devDependenciesToInstall })
  ]);
}

/**
 * Add Otter mobile to an Angular Project
 * @param options ng add options
 */
export const ngAdd = (options: NgAddSchematicsSchema) => createOtterSchematic(ngAddFn)(options);
