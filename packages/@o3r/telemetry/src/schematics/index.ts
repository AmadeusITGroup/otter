import { callRule, Rule } from '@angular-devkit/schematics';
import { performance } from 'node:perf_hooks';
import { lastValueFrom } from 'rxjs';
import { getEnvironmentInfo } from '../environment/index';

type SchematicWrapperFn<S> = (opts: S) => Rule;

/**
 * Type of a function that wraps a schematic
 */
export type SchematicWrapper = <S>(schematicFn: SchematicWrapperFn<S>) => SchematicWrapperFn<S>;

/**
 * Wrapper method of a schematic to retrieve some metrics around the schematic run
 * @param schematicFn
 */
export const createSchematicWithMetrics: SchematicWrapper =
  (schematicFn) => (options) => async (tree, context) => {
    const startTime = Math.floor(performance.now());
    let error;
    try {
      const rule = schematicFn(options);
      await lastValueFrom(callRule(rule, tree, context));
    }
    catch (e: any) {
      error = e.toString();
      throw (e instanceof Error ? e : new Error(error));
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
      const data = {
        environment,
        schematic,
        duration,
        error
      };
      context.logger.debug(JSON.stringify(data, null, 2));
      // TODO handle call to log server here https://github.com/AmadeusITGroup/otter/issues/1201
    }
  };

