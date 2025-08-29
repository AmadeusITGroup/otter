import * as path from 'node:path';
import {
  chain,
} from '@angular-devkit/schematics';
import type {
  Rule,
} from '@angular-devkit/schematics';
import {
  createOtterSchematic,
  ngAddDependenciesRule,
} from '@o3r/schematics';
import {
  updateCmsAdapter,
} from '../cms-adapter';
import type {
  NgAddSchematicsSchema,
} from './schema';

/**
 * List of external dependencies to be added to the project as peer dependencies
 */
const dependenciesToInstall: string[] = [
];

/**
 * List of external dependencies to be added to the project as dev dependencies
 */
const devDependenciesToInstall = [
  '@angular-devkit/architect',
  '@angular-devkit/core',
  'semver'
];

const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');

/**
 * Add Otter extractors to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  return chain([
    ngAddDependenciesRule(options, packageJsonPath, { dependenciesToInstall, devDependenciesToInstall }),
    updateCmsAdapter(options, __dirname)
  ]);
}

/**
 * Add Otter extractors to an Angular Project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema) => createOtterSchematic(ngAddFn)(options);
