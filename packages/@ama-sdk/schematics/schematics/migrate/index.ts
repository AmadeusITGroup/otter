import {
  readFileSync,
} from 'node:fs';
import {
  resolve,
} from 'node:path';
import type {
  Rule,
} from '@angular-devkit/schematics';
import {
  getMigrationRuleRunner,
  getWorkspaceConfig,
  type MigrationRulesMap,
} from '@o3r/schematics';
import {
  createOtterSchematic,
} from '@o3r/schematics';
import {
  gt,
  minVersion,
} from 'semver';
import {
  isTypescriptSdk,
} from '../helpers/is-typescript-project';
import {
  updateV11_4 as updateV114,
} from '../ng-update/typescript';
import {
  updateOpenApiVersionInProject,
} from '../ng-update/typescript/v10.3/update-openapiversion';
import {
  updateRegenScript,
} from '../ng-update/typescript/v11.0/update-regen-script';
import {
  MigrateSchematicsSchemaOptions,
} from './schema';

const tsMigrationMap = {
  '~10.3.2': updateOpenApiVersionInProject(),
  '11.0.*': [
    updateRegenScript
  ],
  '11.4.0-alpha.0': [
    updateV114
  ]
} as const satisfies MigrationRulesMap;

/**
 * Facilitate the migration of a version to another by the run of migration rules
 * @param options
 */
function migrateFn(options: MigrateSchematicsSchemaOptions): Rule {
  const currentVersion = JSON.parse(readFileSync(resolve(__dirname, '..', '..', 'package.json'), { encoding: 'utf8' })).version;
  const to: string = options.to || currentVersion;
  const minimumVersion = minVersion(to);

  return (tree, context) => {
    if (minimumVersion && gt(minimumVersion, currentVersion)) {
      context.logger.warn(`The specified range "${to}" has a minimum supported version higher than the current version of @ama-sdk/schematics (${currentVersion}).`
        + ' The migration may not have any effect.');
    }
    const workingDirectory = (options?.projectName && getWorkspaceConfig(tree)?.projects[options.projectName]?.root) || '/';
    const runMigrateSchematic = isTypescriptSdk(tree, workingDirectory) ? getMigrationRuleRunner(tsMigrationMap, { logger: context.logger }) : undefined;
    return runMigrateSchematic?.({ from: options.from, to });
  };
}

/**
 * Facilitate the migration of a version to another by the run of migration rules
 * @param options
 */
export const migrate = (options: MigrateSchematicsSchemaOptions) => createOtterSchematic(migrateFn)(options);
