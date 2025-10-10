import { Plugin } from '@redocly/openapi-core';
import { type InstallDependenciesOptions } from '@ama-openapi/core';
import { config } from 'dotenv';
import { retrieveDependency } from './plugins/meta/retrieve-dependency.meta.mjs';
import { ENVIRONMENT_VARIABLE_PREFIX } from './constants.mjs';

export interface AmaOpenapiPluginOptions extends InstallDependenciesOptions {
  /** Skip the download of dependency */
  skipDependencyDownload?: boolean;
};

export const amaOpenapiPlugin = async (options?: AmaOpenapiPluginOptions): Promise<Plugin> => {
  config({override: true});

  options = {
    skipDependencyDownload: !!process.env[`${ENVIRONMENT_VARIABLE_PREFIX}_SKIP_DOWNLOAD`],
    ...options
  }

  retrieveDependency(options);

  return {
    id: 'ama-openapi',
  };
};
