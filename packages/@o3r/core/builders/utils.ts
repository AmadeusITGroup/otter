import type {
  BuilderWrapper
} from '@o3r/telemetry';

const noopBuilderWrapper: BuilderWrapper = (fn) => fn;

/**
 * Helper duplicated from the one exposed by `@o3r/extractors`.
 * The one from `@o3r/extractors` cannot be used here because of circular dependencies.
 * This helper is not exposed in `@o3r/core`.
 *
 * Wrapper method of a builder to retrieve some metrics around the builder run
 * if @o3r/telemetry is installed
 * @param builderFn
 */
export const createBuilderWithMetricsIfInstalled: BuilderWrapper = (builderFn) => async (opts, ctx) => {
  let wrapper: BuilderWrapper = noopBuilderWrapper;
  try {
    const { createBuilderWithMetrics } = await import('@o3r/telemetry');
    wrapper = createBuilderWithMetrics;
  } catch {}
  return wrapper(builderFn)(opts, ctx);
};
