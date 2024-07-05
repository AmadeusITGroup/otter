import type {
  BuilderContext,
  BuilderOutput
} from '@angular-devkit/architect';
import { existsSync, readFileSync } from 'node:fs';
import * as path from 'node:path';
import { performance } from 'node:perf_hooks';
import { getEnvironmentInfo } from '../environment/index';
import { BuilderMetricData, sendData as defaultSendData, type SendDataFn } from '../sender';

type BuilderWrapperFn<S, O extends BuilderOutput = BuilderOutput> =
  (opts: S, ctx: BuilderContext) => O | Promise<O>;

/**
 * Type of a function that wraps a builder
 */
export type BuilderWrapper = <S, O extends BuilderOutput = BuilderOutput>(builderFn: BuilderWrapperFn<S, O>, sendData?: SendDataFn) => BuilderWrapperFn<S, O>;

/**
 * Wrapper method of a builder to retrieve some metrics around the builder run
 * @param builderFn
 * @param sendData
 */
export const createBuilderWithMetrics: BuilderWrapper = (builderFn, sendData = defaultSendData) =>
  async (options, context) => {
    const startTime = Math.floor(performance.now());
    let error: any;
    try {
      const result = await builderFn(options, context);
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
      // context.builder.builderName does not contain the package name
      const builderName = context.builder.name as string;
      context.logger.info(`${builderName} run in ${duration}ms`);
      const environment = await getEnvironmentInfo();
      const data: BuilderMetricData = {
        environment,
        duration,
        builder: {
          name: builderName,
          options,
          ...(context.target
            ? {
              target: {
                name: context.target.target,
                projectName: context.target.project,
                configuration: context.target.configuration
              }
            } : {}
          )
        },
        error
      };
      context.logger.debug(JSON.stringify(data, null, 2));
      const packageJsonPath = path.join(context.currentDirectory, 'package.json');
      const packageJson = existsSync(packageJsonPath) ? JSON.parse(readFileSync(packageJsonPath, 'utf-8')) : {};
      const shouldSendData = !!(
        (options as any).o3rMetrics
        ?? ((process.env.O3R_METRICS || '').length > 0 ? process.env.O3R_METRICS !== 'false' : undefined)
        ?? packageJson.config?.o3rMetrics
      );
      if (shouldSendData) {
        if (typeof ((options as any).o3rMetrics ?? process.env.O3R_METRICS) === 'undefined') {
          context.logger.info(
            'Telemetry is globally activated for the project (`config.o3rMetrics` in package.json). '
            + 'If you personally don\'t want to send telemetry, you can deactivate it by setting `O3R_METRICS` to false in your environment variables, '
            + 'or by calling the builder with `--no-o3r-metrics`.'
          );
        }
        void sendData(data, context.logger).catch((e) => {
          // Do not throw error if we don't manage to collect data
          const err = (e instanceof Error ? e : new Error(error));
          context.logger.error(err.stack || err.toString());
        });
      }
    }
  };

