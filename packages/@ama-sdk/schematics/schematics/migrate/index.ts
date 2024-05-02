import type { Rule } from '@angular-devkit/schematics';
import { MigrateSchematicsSchemaOptions } from './schema';
import { getMigrationRuleRunner, getWorkspaceConfig, type MigrationRulesMap } from '@o3r/schematics';
import { resolve } from 'node:path';
import { gt, minVersion } from 'semver';
import { isTypescriptSdk } from '../helpers/is-typescript-project';

const tsMigrationMap: MigrationRulesMap = {

};
/**
 * Facilitate the migration of a version to another by the run of migration rules
 * @param options
 */
function migrateFn(options: MigrateSchematicsSchemaOptions): Rule {

  const currentVersion = JSON.parse(require(resolve(__dirname, '..', '..', 'package.json'))).version;
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
