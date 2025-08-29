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
const dependenciesToInstall = [
  'postcss',
  'postcss-scss',
  'stylelint'
];
const devDependenciesToInstall: string[] = [];

/**
 * Add Otter stylelint-plugin to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return chain([
    ngAddDependenciesRule(options, packageJsonPath, { dependenciesToInstall, devDependenciesToInstall })
  ]);
}

/**
 * Add Otter stylelint-plugin to an Angular Project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema) => createOtterSchematic(ngAddFn)(options);
