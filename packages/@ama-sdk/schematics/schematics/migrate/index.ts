import type { Rule } from '@angular-devkit/schematics';
import { MigrateSchematicsSchemaOptions } from './schema';
import { getMigrationRuleRunner, getWorkspaceConfig, type MigrationRulesMap } from '@o3r/schematics';
import { resolve } from 'node:path';
import { updateRegenScript } from '../ng-update/typescript/v11.0/update-regen-script';
import { gt, minVersion } from 'semver';
import { isTypescriptSdk } from '../helpers/is-typescript-project';
import {updateOpenApiVersionInProject} from '../ng-update/typescript/v10.3/update-openapiversion';

/* eslint-disable @typescript-eslint/naming-convention */
const tsMigrationMap: MigrationRulesMap = {
  '~10.3.2': updateOpenApiVersionInProject(),
  '11.0.*': [
    updateRegenScript
  ]
};
/* eslint-enable @typescript-eslint/naming-convention */
/**
 * Facilitate the migration of a version to another by the run of migration rules
 * @param options
 */
function migrateFn(options: MigrateSchematicsSchemaOptions): Rule {

  const currentVersion = require(resolve(__dirname, '..', '..', 'package.json')).version;
  const to: string = options.to || currentVersion;
  const minimumVersion = minVersion(to);

  return (tree, context) => {
    if (minimumVersion && gt(minimumVersion, currentVersion)) {
      context.logger.warn(`The specified range "${to}" has a minimum supported version higher than the current version of @ama-sdk/schematics (${currentVersion}).` +
      ' The migration may not have any effect.');
    }
    const workingDirectory = options?.projectName && getWorkspaceConfig(tree)?.projects[options.projectName]?.root || '/';
    const runMigrateSchematic = isTypescriptSdk(tree, workingDirectory) ? getMigrationRuleRunner(tsMigrationMap, { logger: context.logger }) : undefined;
    return runMigrateSchematic?.({from: options.from, to});
  };
}

/**
 * Facilitate the migration of a version to another by the run of migration rules
 * @param options
 */
export const migrate = (options: MigrateSchematicsSchemaOptions) => async () => {
  const { createSchematicWithMetricsIfInstalled } = await import('@o3r/schematics');
  return createSchematicWithMetricsIfInstalled(migrateFn)(options);
};
