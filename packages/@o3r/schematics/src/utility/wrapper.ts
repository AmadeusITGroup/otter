import {
  readFileSync,
} from 'node:fs';
import * as path from 'node:path';
import type {
  JsonObject,
} from '@angular-devkit/core';
import {
  applyToSubtree,
  chain,
  noop,
  type Rule,
} from '@angular-devkit/schematics';
import confirm from '@inquirer/confirm';
import type {
  SchematicWrapper,
} from '@o3r/telemetry';
import {
  NodeDependencyType,
} from '@schematics/angular/utility/dependencies';
import {
  hasSetupInformation,
  setupDependencies,
} from '../rule-factories/ng-add/dependencies';
import {
  createSchematicWithOptionsFromWorkspace,
} from '../rule-factories/options/index';

const noopSchematicWrapper: SchematicWrapper = (fn) => fn;

const PACKAGE_JSON_PATH = 'package.json';
const ENV_VAR_LIST = ['CI', 'CONTINUOUS_INTEGRATION'] as const;

const setupO3rMetricsInPackageJson: (activated: boolean) => Rule = (activated) => (tree) => {
  if (tree.exists(PACKAGE_JSON_PATH)) {
    const packageJson = tree.readJson(PACKAGE_JSON_PATH) as JsonObject;

    packageJson.config ||= {};
    (packageJson.config as JsonObject).o3r ||= {};
    ((packageJson.config as JsonObject).o3r as JsonObject).telemetry = activated;

    tree.overwrite(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2));
  }
};

const enVarValueCheck = (value: any) => !!value && value !== 'false' && value !== '0';
const isInCI = () => {
  return ENV_VAR_LIST.some((label) => enVarValueCheck(process.env[label]))
    || Object.entries(process.env).some(([envVar, value]) => envVar.startsWith('CI_') && enVarValueCheck(value))
    || !process.stdin.isTTY;
};

const setupTelemetry: (opts: { workingDirectory?: string; runNgAdd?: boolean; exactO3rVersion?: boolean }) => Rule = ({ workingDirectory, runNgAdd, exactO3rVersion }) => (_, context) => {
  const taskIdsFromContext = hasSetupInformation(context) ? context.setupDependencies.taskIds : undefined;
  const version = JSON.parse(readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf8')).version;
  return setupDependencies({
    dependencies: {
      '@o3r/telemetry': {
        inManifest: [{
          range: `${exactO3rVersion ? '' : '~'}${version}`,
          types: [NodeDependencyType.Dev]
        }],
        ngAddOptions: { exactO3rVersion }
      }
    },
    ngAddToRun: runNgAdd ? ['@o3r/telemetry'] : [],
    runAfterTasks: taskIdsFromContext,
    workingDirectory
  });
};

/**
 * Wrapper method of a schematic to retrieve some metrics around the schematic run
 * if `@o3r/telemetry` is installed
 * NOTE: please do not use it directly, instead use {@link createOtterSchematic} to wrap your schematic
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
      && typeof ((packageJson.config as JsonObject)?.o3r as JsonObject)?.telemetry === 'undefined'
      && process.env.O3R_METRICS !== 'false'
      && (opts as any).o3rMetrics !== false
      && !isInCI()
    ) {
      context.logger.debug('`@o3r/telemetry` is not available.\nAsking to add the dependency\n' + e.toString());

      shouldInstallTelemetry = await confirm({
        message: `
Would you like to share anonymous data about the usage of Otter builders and schematics with the Otter Team at Amadeus ?
It will help us to improve our tools.
For more details and instructions on how to change these settings, see https://github.com/AmadeusITGroup/otter/blob/main/docs/telemetry/PRIVACY_NOTICE.md
        `,
        default: false
      });
    }
  }
  const subtreeDirectory = context.schematic.description.name === 'typescript-shell' ? (opts as any).directory.split(path.posix.sep).join(path.sep) ?? '' : '';

  const rule = chain([
    typeof shouldInstallTelemetry === 'undefined' ? noop() : applyToSubtree(subtreeDirectory, [setupO3rMetricsInPackageJson(!!shouldInstallTelemetry)]),
    schematicFn(opts),
    shouldInstallTelemetry
      ? applyToSubtree(subtreeDirectory, [
        setupTelemetry({ workingDirectory: subtreeDirectory || undefined, runNgAdd: !subtreeDirectory, exactO3rVersion: (opts as any).exactO3rVersion })
      ])
      : noop(),
    typeof shouldInstallTelemetry !== 'undefined' && subtreeDirectory ? applyToSubtree(subtreeDirectory, [setupO3rMetricsInPackageJson(shouldInstallTelemetry)]) : noop()
  ]);
  return wrapper(() => rule)(opts);
};

/**
 * Wrapper method of an Otter schematics
 * @param schematicFn
 */
export const createOtterSchematic = (schematicFn: (options: any) => Rule) => createSchematicWithOptionsFromWorkspace(createSchematicWithMetricsIfInstalled(schematicFn));
