import * as path from 'node:path';
import type {
  Rule,
} from '@angular-devkit/schematics';
import {
  createOtterSchematic,
  ngAddSchematicWrapper,
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

const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');

/**
 * Add Otter schematics to an Angular Project
 * @param _options schematics options
 */
function ngAddFn(_options: NgAddSchematicsSchema): Rule {
  return () => {};
}

/**
 * Add Otter schematics to an Angular Project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema) => createOtterSchematic(
  ngAddSchematicWrapper(
    packageJsonPath,
    {
      dep: dependenciesToInstall,
      devDep: devDependenciesToInstall
    },
    ngAddFn,
    undefined,
    {
      skipInstall: false
    }
  )
)(options);
