import type { JsonObject } from '@angular-devkit/core';
import { applyToSubtree, chain, noop, type Rule } from '@angular-devkit/schematics';
import type { SchematicWrapper } from '@o3r/telemetry';
import { NodeDependencyType } from '@schematics/angular/utility/dependencies';
import { prompt, Question } from 'inquirer';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { hasSetupInformation, setupDependencies } from '../rule-factories';

const noopSchematicWrapper: SchematicWrapper = (fn) => fn;

const PACKAGE_JSON_PATH = 'package.json';

const setupO3rMetricsInPackageJson: (activated: boolean) => Rule = (activated) => (tree) => {
  if (tree.exists(PACKAGE_JSON_PATH)) {
    const packageJson = tree.readJson(PACKAGE_JSON_PATH) as JsonObject;

    packageJson.config ||= {};
    (packageJson.config as JsonObject).o3rMetrics = activated;

    tree.overwrite(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2));
  }
};

const setupTelemetry: (opts: {workingDirectory?: string; runNgAdd?: boolean}) => Rule = ({ workingDirectory, runNgAdd }) => (_, context) => {
  const taskIdsFromContext = hasSetupInformation(context) ? context.setupDependencies.taskIds : undefined;
  const version = JSON.parse(readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf-8')).version;
  return setupDependencies({
    dependencies: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '@o3r/telemetry': {
        inManifest: [{
          range: `~${version}`,
          types: [NodeDependencyType.Dev]
        }]
      }
    },
    ngAddToRun: runNgAdd ? ['@o3r/telemetry'] : [],
    runAfterTasks: taskIdsFromContext,
    workingDirectory
  });
};

/**
 * Wrapper method of a schematic to retrieve some metrics around the schematic run
 * if @o3r/telemetry is installed
 * @param schematicFn
 */
export const createSchematicWithMetricsIfInstalled: SchematicWrapper = (schematicFn) => (opts) => async (tree, context) => {
  let wrapper: SchematicWrapper = noopSchematicWrapper;
  let shouldInstallTelemetry: boolean | undefined;
  const packageJson = tree.exists(PACKAGE_JSON_PATH) ? tree.readJson(PACKAGE_JSON_PATH) as JsonObject : {};
  try {
    const { createSchematicWithMetrics } = await import('@o3r/telemetry');
    wrapper = createSchematicWithMetrics;
  } catch (e: any) {
    // Do not throw if `@o3r/telemetry is not installed
    if (
      (process.env.NX_CLI_SET !== 'true' || process.env.NX_INTERACTIVE === 'true')
      && context.interactive
      && typeof (packageJson.config as JsonObject)?.o3rMetrics === 'undefined'
      && process.env.O3R_METRICS !== 'false'
      && (opts as any).o3rMetrics !== false
      && (!process.env.CI || process.env.CI === 'false')
    ) {
      context.logger.debug('`@o3r/telemetry` is not available.\nAsking to add the dependency\n' + e.toString());

      const question: Question = {
        type: 'confirm',
        name: 'isReplyPositive',
        message: `
Would you like to share anonymous data about the usage of Otter builders and schematics with the Otter Team at Amadeus ?
It will help us to improve our tools.
For more details and instructions on how to change these settings, see https://github.com/AmadeusITGroup/otter/blob/main/docs/telemetry/README.md.
        `,
        default: false
      };
      const { isReplyPositive } = await prompt([question]);
      shouldInstallTelemetry = isReplyPositive;
    }
  }
  const subtreeDirectory = context.schematic.description.name === 'typescript-shell' ? (opts as any).directory.split(path.posix.sep).join(path.sep) ?? '' : '';

  const rule = chain([
    typeof shouldInstallTelemetry !== 'undefined' ? applyToSubtree(subtreeDirectory, [setupO3rMetricsInPackageJson(!!shouldInstallTelemetry)]) : noop(),
    schematicFn(opts),
    shouldInstallTelemetry ? applyToSubtree(subtreeDirectory, [setupTelemetry({ workingDirectory: subtreeDirectory || undefined, runNgAdd: !subtreeDirectory })]) : noop(),
    typeof shouldInstallTelemetry !== 'undefined' && subtreeDirectory ? applyToSubtree(subtreeDirectory, [setupO3rMetricsInPackageJson(shouldInstallTelemetry)]) : noop()
  ]);
  return wrapper(() => rule)(opts);
};
