import {
  resolve,
} from 'node:path';
import {
  chain,
  type Rule,
} from '@angular-devkit/schematics';
import {
  createOtterSchematic,
  ngAddDependenciesRule,
} from '@o3r/schematics';
import {
  registerDevtools,
} from './helpers/devtools-registration';
import type {
  NgAddSchematicsSchema,
} from './schema';

const packageJsonPath = resolve(__dirname, '..', '..', 'package.json');

/**
 * Add Otter Ama styling devkit to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return chain([
    ngAddDependenciesRule(options, packageJsonPath, {}),
    registerDevtools(options)
  ]);
}

/**
 * Add Otter Ama styling devkit to an Angular Project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema) => createOtterSchematic(ngAddFn)(options);
