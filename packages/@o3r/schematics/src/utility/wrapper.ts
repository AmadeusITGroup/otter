import type { SchematicWrapper } from '@o3r/telemetry';

const noopSchematicWrapper: SchematicWrapper = (fn) => fn;

/**
 * Wrapper method of a schematic to retrieve some metrics around the schematic run
 * if @o3r/telemetry is installed
 * @param schematicFn
 */
export const createSchematicWithMetricsIfInstalled: SchematicWrapper = (schematicFn) => (opts) => async () => {
  let wrapper: SchematicWrapper = noopSchematicWrapper;
  try {
    const { createSchematicWithMetrics } = await import('@o3r/telemetry');
    wrapper = createSchematicWithMetrics;
  } catch {}
  return wrapper(schematicFn)(opts);
};
