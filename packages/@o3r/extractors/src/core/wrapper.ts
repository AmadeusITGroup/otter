import {
  execFileSync,
} from 'node:child_process';
import {
  existsSync,
  promises,
} from 'node:fs';
import * as path from 'node:path';
import confirm from '@inquirer/confirm';
import {
  getPackageManagerRunner,
} from '@o3r/schematics';
import type {
  BuilderWrapper,
} from '@o3r/telemetry';

const ENV_VAR_LIST = ['CI', 'CONTINUOUS_INTEGRATION'] as const;

const noopBuilderWrapper: BuilderWrapper = (fn) => fn;

const enVarValueCheck = (value: any) => !!value && value !== 'false' && value !== '0';
const isInCI = () => {
  return ENV_VAR_LIST.some((label) => enVarValueCheck(process.env[label]))
    || Object.entries(process.env).some(([envVar, value]) => envVar.startsWith('CI_') && enVarValueCheck(value))
    || !process.stdin.isTTY;
};

/**
 * Wrapper method of a builder to retrieve some metrics around the builder run
 * if @o3r/telemetry is installed
 * @param builderFn
 */
export const createBuilderWithMetricsIfInstalled: BuilderWrapper = (builderFn) => async (opts, ctx) => {
  const packageJsonPath = path.join(ctx.workspaceRoot, 'package.json');
  const packageJson = existsSync(packageJsonPath)
    ? JSON.parse(await promises.readFile(packageJsonPath, { encoding: 'utf8' }))
    : {};
  let wrapper: BuilderWrapper = noopBuilderWrapper;
  try {
    const { createBuilderWithMetrics } = await import('@o3r/telemetry');
    wrapper = createBuilderWithMetrics;
  } catch (e: any) {
    // Do not throw if `@o3r/telemetry is not installed
    if (
      packageJson.config?.o3r?.telemetry
      // TODO `o3rMetrics` is deprecated and will be removed in v13
      || packageJson.config?.o3rMetrics === true
    ) {
      ctx.logger.info('`config.o3r.telemetry` is set in your package.json, please install the telemetry package with `ng add @o3r/telemetry` to enable the collection of metrics.');
    } else if (
      !isInCI()
      && (process.env.NX_CLI_SET !== 'true' || process.env.NX_INTERACTIVE === 'true')
      && packageJson.config?.o3r?.telemetry !== false
      // TODO `o3rMetrics` is deprecated and will be removed in v13
      && packageJson.config?.o3rMetrics !== false
      && process.env.O3R_METRICS !== 'false'
      && (opts as any).o3rMetrics !== false
    ) {
      ctx.logger.debug('`@o3r/telemetry` is not available.\nAsking to add the dependency\n' + e.toString());

      const isReplyPositive = await confirm({
        message: `
Would you like to share anonymous data about the usage of Otter builders and schematics with the Otter Team at Amadeus ?
It will help us to improve our tools.
For more details and instructions on how to change these settings, see https://github.com/AmadeusITGroup/otter/blob/main/docs/telemetry/PRIVACY_NOTICE.md
        `,
        default: false
      });

      if (isReplyPositive) {
        const pmr = getPackageManagerRunner(packageJson);

        try {
          const version = JSON.parse(await promises.readFile(path.join(__dirname, '..', '..', 'package.json'), 'utf8')).version;
          execFileSync(`${pmr} ng add @o3r/telemetry@${version}`);
        } catch {
          ctx.logger.warn('Failed to install `@o3r/telemetry`.');
        }

        try {
          const { createBuilderWithMetrics } = await import('@o3r/telemetry');
          wrapper = createBuilderWithMetrics;
        } catch {
          // If pnp context package installed in the same process will not be available
        }
      } else {
        ctx.logger.info('You can activate it at any time by running `ng add @o3r/telemetry`.');

        packageJson.config ||= {};
        packageJson.config.o3r ||= {};
        packageJson.config.o3r.telemetry = false;

        if (existsSync(packageJsonPath)) {
          await promises.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
        } else {
          ctx.logger.warn(`No package.json found in ${ctx.workspaceRoot}.`);
        }
      }
    }
  }
  return wrapper(builderFn)(opts, ctx);
};
