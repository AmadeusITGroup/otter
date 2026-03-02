import {
  cwd,
} from 'node:process';
import type {
  Context,
} from './context.mjs';
import {
  cleanOutputDirectory,
} from './core/file-system/cleaner.mjs';
import {
  extractDependencyModels,
} from './core/manifest/extract-dependency-models.mjs';
import {
  retrieveManifest,
} from './core/manifest/manifest.mjs';
import {
  processModel,
} from './core/process.mjs';
import type {
  Logger,
} from './logger.mjs';

/** Options for Install Dependencies */
export interface InstallDependenciesOptions {
  /** Logger instance */
  logger?: Logger;
}

/**
 * Run the process to download and write dependency models
 * @param workingDirectory
 * @param options
 */
export const installDependencies = async (workingDirectory = cwd(), options?: InstallDependenciesOptions): Promise<void> => {
  const { logger = console } = options || {};
  const manifest = await retrieveManifest(workingDirectory, logger);
  const context = {
    cwd: workingDirectory,
    logger
  } satisfies Context;

  if (!manifest) {
    logger?.info('No Manifest file discovered');
    return;
  }

  await cleanOutputDirectory(context);
  const models = extractDependencyModels(manifest, context);

  const results = await Promise.allSettled(processModel(models, context));

  const rejected = results
    .filter((result): result is PromiseRejectedResult => result.status === 'rejected');

  if (rejected.length > 0) {
    logger?.error(`Failed to retrieve some models:`);
    rejected.forEach((result) => logger?.error(result.reason));
    await cleanOutputDirectory(context);
    throw new Error('Failed to retrieve some models');
  }

  logger?.info(`Successfully retrieved all models`);
};
