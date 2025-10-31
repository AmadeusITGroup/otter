import {
  Plugin,
} from '@redocly/openapi-core';
import {
  config,
} from 'dotenv';
import {
  ENVIRONMENT_VARIABLE_PREFIX,
} from './constants.mjs';
import type {
  LogLevel,
} from './logger.mjs';
import {
  retrieveDependency,
  type RetrieveDependencyOptions,
} from './plugins/meta/retrieve-dependency.meta.mjs';

const DEFAULT_OPTIONS: LogLevel = 'error';

/** Options for ama-openapi plugin */
export interface AmaOpenapiPluginOptions extends Partial<RetrieveDependencyOptions> {
}

/**
 * Ama OpenAPI {@link https://redocly.com/docs/cli/custom-plugins | Redocly Plugin}
 * @param options
 */
export const amaOpenapiPlugin = async (options?: AmaOpenapiPluginOptions): Promise<Plugin> => {
  config({ override: true, quiet: true });

  const {
    [`${ENVIRONMENT_VARIABLE_PREFIX}_VERBOSE`]: verbose,
    [`${ENVIRONMENT_VARIABLE_PREFIX}_QUIET`]: quiet,
    [`${ENVIRONMENT_VARIABLE_PREFIX}_NO_BAIL`]: noBail
  } = process.env;

  await retrieveDependency({
    logLevel: verbose === 'true' ? 'debug' : (options?.logLevel ?? DEFAULT_OPTIONS),
    quiet: quiet ? quiet === 'true' : options?.quiet ?? false,
    noBail: noBail ? noBail === 'true' : options?.noBail ?? false
  });

  return {
    id: 'ama-openapi'
  };
};
