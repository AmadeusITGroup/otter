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
  updateImports,
} from '@o3r/schematics';
import {
  mapMigrationFromCoreImports,
} from './migration/import-map';
import type {
  NgAddSchematicsSchema,
} from './schema';

/**
 * List of external dependencies to be added to the project as peer dependencies
 */
const dependenciesToInstall = [
  'rxjs'
];

/**
 * List of external dependencies to be added to the project as dev dependencies
 */
const devDependenciesToInstall: string[] = [
];

const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');

/**
 * Add SDk Angular Client to an Otter Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  return chain([
    // optional custom action dedicated to this module
    options.skipLinter ? noop() : applyEsLintFix(),
    ngAddDependenciesRule(options, packageJsonPath, { dependenciesToInstall, devDependenciesToInstall }),
    updateImports(mapMigrationFromCoreImports)
  ]);
}

/**
 * Add SDk Angular Client to an Otter Project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema) => createOtterSchematic(ngAddFn)(options);
