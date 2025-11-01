import {
  installDependencies,
  type InstallDependenciesOptions,
} from '@ama-openapi/core';
import {
  ENVIRONMENT_VARIABLE_PREFIX,
} from '../../constants.mjs';
import {
  getLogger,
  type LogLevel,
} from '../../logger.mjs';

export interface RetrieveDependencyOptions extends InstallDependenciesOptions {
  /**
   * Define the logging level
   * @default 'error'
   */
  logLevel?: LogLevel;

  /** Continue on dependency download failure */
  noBail?: boolean;
}

const DEFAULT_OPTIONS: RetrieveDependencyOptions = {
  logLevel: 'error'
};

/**
 * Retrieve dependencies according to manifest files
 * @param options
 */
export const retrieveDependency = async (options?: RetrieveDependencyOptions) => {
  options = {
    ...DEFAULT_OPTIONS,
    noBail: !!process.env[`${ENVIRONMENT_VARIABLE_PREFIX}_NO_BAIL`],
    ...options
  };
  const logger = getLogger(options?.logLevel || DEFAULT_OPTIONS.logLevel, options?.logger);

  try {
    await installDependencies(process.cwd(), { ...options, logger });
  } catch (e) {
    if (options?.noBail) {
      logger?.error(e);
    } else {
      throw e;
    }
  }
};
