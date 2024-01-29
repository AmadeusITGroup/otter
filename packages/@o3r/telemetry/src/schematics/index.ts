import { callRule, Rule } from '@angular-devkit/schematics';
import { performance } from 'node:perf_hooks';
import { lastValueFrom } from 'rxjs';
import { getEnvironmentInfo } from '../environment/index';
import { sendData as defaultSendData, SchematicMetricData, type SendDataFn } from '../sender';

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
 */
export const createSchematicWithMetrics: SchematicWrapper =
  (schematicFn, sendData = defaultSendData) => (options) => async (tree, context) => {
    const startTime = Math.floor(performance.now());
    let error: any;
    try {
      const rule = schematicFn(options);
      await lastValueFrom(callRule(rule, tree, context));
    }
    catch (e: any) {
      const err = e instanceof Error ? e : new Error(error);
      error = err.stack || e.toString();
      throw err;
    }
    finally {
      const endTime = Math.floor(performance.now());
      const duration = endTime - startTime;
      const environment = getEnvironmentInfo();
      const schematic = {
        name: `${context.schematic.description.collection.name}:${context.schematic.description.name}`,
        options,
        interactive: context.interactive
      };
      const data: SchematicMetricData = {
        environment,
        schematic,
        duration,
        error
      };
      context.logger.debug(JSON.stringify(data, null, 2));
      void sendData(data, context.logger).catch((e) => {
        // Do not throw error if we don't manage to collect data
        const err = (e instanceof Error ? e : new Error(error));
        context.logger.error(err.stack || err.toString());
      });
    }
  };

