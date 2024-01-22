import type {
  BuilderContext,
  BuilderOutput
} from '@angular-devkit/architect';
import { getEnvironmentInfo } from '../environment/index';
import { performance } from 'node:perf_hooks';
import { BuilderMetricData, sendData as defaultSendData } from '../sender';

type BuilderWrapperFn<S, O extends BuilderOutput = BuilderOutput> =
  (opts: S, ctx: BuilderContext) => O | Promise<O>;

type SendDataFn = (data: BuilderMetricData, logger?: { error: (msg: string) => void } | undefined) => Promise<void>;

/**
 * Type of a function that wraps a builder
 */
export type BuilderWrapper = <S, O extends BuilderOutput = BuilderOutput>
  (builderFn: BuilderWrapperFn<S, O>, sendData?: SendDataFn) => BuilderWrapperFn<S, O>;

/**
 * Wrapper method of a builder to retrieve some metrics around the builder run
 * @param builderFn
 */
export const createBuilderWithMetrics: BuilderWrapper = (builderFn, sendData = defaultSendData) =>
  async (options, context) => {
    const startTime = Math.floor(performance.now());
    let error;
    try {
      const result = await builderFn(options, context);
      return result;
    }
    catch (e: any) {
      const err = e instanceof Error ? e : new Error(error);
      error = err.stack || err.toString();
      throw err;
    }
    finally {
      try {
        const endTime = Math.floor(performance.now());
        const duration = endTime - startTime;
        // context.builder.builderName does not contain the package name
        const builderName = context.builder.name as string;
        context.logger.info(`${builderName} run in ${duration}ms`);
        const environment = getEnvironmentInfo();
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
        await sendData(data, context.logger);
      } catch (e: any) {
        // Do not throw error if we don't manage to collect data
        const err = (e instanceof Error ? e : new Error(error));
        context.logger.error(err.stack || err.toString());
      }
    }
  };

