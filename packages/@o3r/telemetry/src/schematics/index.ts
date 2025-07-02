import {
  performance,
} from 'node:perf_hooks';
import type {
  JsonObject,
} from '@angular-devkit/core';
import type {
  Rule,
} from '@angular-devkit/schematics';
import {
  getEnvironmentInfo,
} from '../environment/index';
import {
  sendData as defaultSendData,
  SchematicMetricData,
  type SendDataFn,
} from '../sender';

/**
 * Factory of the schematic to wrap
 * @param options Options of the factory
 */
type SchematicWrapperFn<S> = (options: S) => Rule;

/**
 * Type of a function that wraps a schematic
 */
export type SchematicWrapper = <S>(schematicFn: SchematicWrapperFn<S>, sendData?: SendDataFn) => SchematicWrapperFn<S>;

/**
 * Wrapper method of a schematic to retrieve some metrics around the schematic run
 * @param schematicFn
 * @param sendData
 */
export const createSchematicWithMetrics: SchematicWrapper = (schematicFn, sendData = defaultSendData) => (options) => async (tree, context) => {
  const startTime = Math.floor(performance.now());
  let error: any;
  try {
    const rule = schematicFn(options);
    const { callRule } = await import('@angular-devkit/schematics');
    const { lastValueFrom } = await import('rxjs');
    await lastValueFrom(callRule(rule, tree, context));
  } catch (e: any) {
    const err = e instanceof Error ? e : new Error(e.toString());
    error = err.stack || err.toString();
    throw err;
  } finally {
    const endTime = Math.floor(performance.now());
    const duration = endTime - startTime;
    const environment = await getEnvironmentInfo();
    const schematic = {
      name: `${context.schematic.description.collection.name}:${context.schematic.description.name}`,
      options,
      interactive: context.interactive
    };
    const data = {
      environment,
      schematic,
      duration,
      error
    } as const satisfies SchematicMetricData;
    context.logger.debug(JSON.stringify(data, null, 2));
    const packageJson = (tree.exists('/package.json') ? tree.readJson('/package.json') : {}) as JsonObject;
    const shouldSendData = !!(
      (options as any).o3rMetrics
      ?? ((process.env.O3R_METRICS || '').length > 0 ? process.env.O3R_METRICS !== 'false' : undefined)
      ?? ((packageJson.config as JsonObject)?.o3r as JsonObject)?.telemetry
      ?? (packageJson.config as JsonObject)?.o3rMetrics // deprecated will be removed in v13
    );
    if (typeof (packageJson.config as JsonObject)?.o3rMetrics !== 'undefined') {
      context.logger.warn([
        '`config.o3rMetrics` is deprecated and will be removed in v13, please use `config.o3r.telemetry` instead.',
        'You can run `ng update @o3r/telemetry` to have the automatic update.'
      ].join('\n'));
    }
    if (shouldSendData) {
      if (typeof ((options as any).o3rMetrics ?? process.env.O3R_METRICS) === 'undefined') {
        context.logger.info(
          'Telemetry is globally activated for the project (`config.o3r.telemetry` in package.json). '
          + 'If you personally don\'t want to send telemetry, you can deactivate it by setting `O3R_METRICS` to false in your environment variables, '
          + 'or by calling the schematic with `--no-o3r-metrics`.'
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
