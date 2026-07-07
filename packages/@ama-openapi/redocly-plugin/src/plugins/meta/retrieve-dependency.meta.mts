import {
  getLogger,
  installDependencies,
  type InstallDependenciesOptions,
  type LogLevel,
  // eslint-disable-next-line import/no-unresolved -- Cannot resolve mjs file in current setup (see #3738)
} from '@ama-openapi/core';
import {
  logger,
} from '@redocly/openapi-core';

/**
 * Options to retrieve dependency
 */
export interface RetrieveDependencyOptions extends InstallDependenciesOptions {
  /**
   * Define the logging level
   * @default 'error'
   */
  logLevel: LogLevel;

  /** Suppress all output */
  quiet: boolean;

  /** Continue on dependency download failure */
  continueOnError: boolean;
}

/**
 * Retrieve dependencies according to manifest files.
 * Refer to {@link InstallDependencies} for more information
 * @param options
 */
export const retrieveDependency = async (options: RetrieveDependencyOptions) => {
  const amaLogger = options.quiet ? undefined : getLogger(options.logLevel, logger);

  try {
    await installDependencies(process.cwd(), { ...options, logger: amaLogger });
  } catch (e) {
    if (options?.continueOnError) {
      amaLogger?.error(e);
    } else {
      throw e;
    }
  }
};
