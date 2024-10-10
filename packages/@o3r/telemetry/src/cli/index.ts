import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import minimist from 'minimist';
import type { Opts as MinimistOptions } from 'minimist';
import { getEnvironmentInfo } from '../environment';
import { type CliMetricData, sendData as defaultSendData, type SendDataFn } from '../sender';

/** Simple Logger interface */
interface Logger {
  /** Error message to display */
  error: (message: string) => void;
  /** Error message to display */
  warn: (message: string) => void;
  /** Information message to display */
  info: (message: string) => void;
  /** Debug message message to display */
  debug: (message: string) => void;
}

/** Custom options for the CLI wrapper */
interface CliWrapperOptions {
  /** Logger */
  logger?: Logger;
  /** Function to send the data to the server */
  sendData?: SendDataFn;
  /** Options to parse the CLI arguments with `minimist` */
  minimistOptions?: MinimistOptions;
  /** CLI arguments pre-parsed to override the ones found by `minimist` */
  preParsedOptions?: any;
}

/**
 * Type of a function that wraps a CLI
 */
export type CliWrapper = <T extends (...args: any) => any>(
  cliFn: (...args: Parameters<T>) => ReturnType<T>, cliName: string, options?: CliWrapperOptions
) => (...args: Parameters<T>) => Promise<ReturnType<T>>;

export const createCliWithMetrics: CliWrapper = (cliFn, cliName, options) => async (...cliFnArgs) => {
  const logger: Logger = options?.logger || console;
  const sendData = options?.sendData || defaultSendData;
  const startTime = Math.floor(performance.now());
  let error: any;
  try {
    // eslint-disable-next-line @typescript-eslint/await-thenable
    const result = await cliFn(...cliFnArgs);
    return result;
  }
  catch (e: any) {
    const err = e instanceof Error ? e : new Error(e.toString());
    error = err.stack || err.toString();
    throw err;
  }
  finally {
    const endTime = Math.floor(performance.now());
    const duration = endTime - startTime;
    logger.info(`${cliName} run in ${duration}ms`);
    const environment = await getEnvironmentInfo();
    const argv = minimist(process.argv.slice(2), { ...options?.minimistOptions, alias: { o3rMetrics: ['o3r-metrics']} });
    const data = {
      environment,
      duration,
      cli: {
        name: cliName,
        options: options?.preParsedOptions ?? argv
      },
      error
    } as const satisfies CliMetricData;
    logger.debug(JSON.stringify(data, null, 2));
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = existsSync(packageJsonPath) ? JSON.parse(readFileSync(packageJsonPath, 'utf-8')) : {};
    const shouldSendData = !!(
      argv.o3rMetrics
        ?? ((process.env.O3R_METRICS || '').length > 0 ? process.env.O3R_METRICS !== 'false' : undefined)
        ?? packageJson.config?.o3r?.telemetry
        ?? packageJson.config?.o3rMetrics // deprecated will be removed in v13
    );
    if (typeof packageJson.config?.o3rMetrics !== 'undefined') {
      logger.warn([
        '`config.o3rMetrics` is deprecated and will be removed in v13, please use `config.o3r.telemetry` instead.',
        'You can run `ng update @o3r/telemetry` to have the automatic update.'
      ].join('\n'));
    }
    if (shouldSendData) {
      if (typeof (argv.o3rMetrics ?? process.env.O3R_METRICS) === 'undefined') {
        logger.info(
          'Telemetry is globally activated for the project (`config.o3r.telemetry` in package.json). '
            + 'If you personally don\'t want to send telemetry, you can deactivate it by setting `O3R_METRICS` to false in your environment variables, '
            + 'or by calling the cli with `--no-o3r-metrics`.'
        );
      }
      void sendData(data, logger).catch((e) => {
        // Do not throw error if we don't manage to collect data
        const err = (e instanceof Error ? e : new Error(error));
        logger.error(err.stack || err.toString());
      });
    }
  }
};
