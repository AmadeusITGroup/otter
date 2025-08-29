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

const devDependenciesToInstall: string[] = [

];
const dependenciesToInstall: string[] = [

];

const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');

/**
 * Add SDk Fetch Client to an Otter Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  return chain([
    options.skipLinter ? noop() : applyEsLintFix(),
    ngAddDependenciesRule(options, packageJsonPath, { dependenciesToInstall, devDependenciesToInstall }),

    updateImports(mapMigrationFromCoreImports)
  ]);
}

/**
 * Add SDk Fetch Client to an Otter Project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema) => createOtterSchematic(ngAddFn)(options);
