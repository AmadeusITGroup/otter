import {
  installDependencies,
  type InstallDependenciesOptions,
  // eslint-disable-next-line import/no-unresolved -- Cannot resolve mjs file in current setup
} from '@ama-openapi/core';
import {
  getLogger,
  type LogLevel,
} from '../../logger.mjs';

export interface RetrieveDependencyOptions extends InstallDependenciesOptions {
  /**
   * Define the logging level
   * @default 'error'
   */
  logLevel: LogLevel;

  /** Suppress all output */
  quiet: boolean;

  /** Continue on dependency download failure */
  noBail: boolean;
}

/**
 * Retrieve dependencies according to manifest files.
 * Refer to {@link InstallDependencies} for more information
 * @param options
 */
export const retrieveDependency = async (options: RetrieveDependencyOptions) => {
  const logger = options.quiet ? undefined : getLogger(options.logLevel);

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
