import {
  type InstallDependenciesOptions,
} from '@ama-openapi/core';
import {
  Plugin,
} from '@redocly/openapi-core';
import {
  config,
} from 'dotenv';
import {
  ENVIRONMENT_VARIABLE_PREFIX,
} from './constants.mjs';
import {
  retrieveDependency,
} from './plugins/meta/retrieve-dependency.meta.mjs';

/** Options for ama-openapi plugin */
export interface AmaOpenapiPluginOptions extends InstallDependenciesOptions {
  /** Skip the download of dependency */
  skipDependencyDownload?: boolean;
}

/**
 * Ama OpenAPI Redocly Plugin
 * @param options
 */
export const amaOpenapiPlugin = async (options?: AmaOpenapiPluginOptions): Promise<Plugin> => {
  config({ override: true });

  options = {
    skipDependencyDownload: !!process.env[`${ENVIRONMENT_VARIABLE_PREFIX}_SKIP_DOWNLOAD`],
    ...options
  };

  await retrieveDependency(options);

  return {
    id: 'ama-openapi'
  };
};
