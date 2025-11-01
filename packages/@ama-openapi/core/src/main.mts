import {
  cwd,
} from 'node:process';
import {
  cleanOutputDirectory,
} from './core/file-system/cleaner.mjs';
import {
  writeModelFile,
} from './core/file-system/write-model.mjs';
import {
  extractDependencyModels,
} from './core/manifest/extract-dependency-models.mjs';
import {
  retrieveManifest,
} from './core/manifest/manifest.mjs';
import {
  deserialize,
  serialize,
} from './core/serialization.mjs';
import {
  addAnnotation,
} from './core/transforms/add-annotation.mjs';
import {
  applyMask,
} from './core/transforms/apply-mask.mjs';
import {
  renameTitle,
} from './core/transforms/rename.mjs';
import {
  toReference,
} from './core/transforms/to-reference.mjs';
import {
  updateReferences,
} from './core/transforms/update-references.mjs';
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

  if (!manifest) {
    logger?.info('No Manifest file discovered');
    return;
  }

  await cleanOutputDirectory(workingDirectory);
  const models = extractDependencyModels(workingDirectory, manifest, logger);

  await cleanOutputDirectory(workingDirectory);

  const results = await Promise.allSettled(
    models
      .map(async (retrievedModelPromise) => {
        const retrievedModel = await retrievedModelPromise;
        logger?.debug?.(`Retrieving model from ${retrievedModel.artifactName} at ${retrievedModel.modelPath}`);
        const modelObj = deserialize(retrievedModel.content, retrievedModel) as object;

        const transforms = [toReference, addAnnotation, applyMask, updateReferences, renameTitle];
        transforms.reduce((acc, transform) => transform(acc, retrievedModel, logger), deserialize(retrievedModel.content, retrievedModel) as object);
        return {
          ...retrievedModel,
          content: serialize(modelObj, retrievedModel)
        };
      })
      .map(async (processedModel) => {
        await writeModelFile(await processedModel);
      })
  );

  const rejected = results
    .filter((result): result is PromiseRejectedResult => result.status === 'rejected');

  if (rejected.length > 0) {
    logger?.error(`Failed to retrieve some models:`);
    rejected.forEach((result) => logger?.error(result.reason));
    throw new Error('Failed to retrieve some models');
  }

  logger?.info(`Successfully retrieved all models`);
};
