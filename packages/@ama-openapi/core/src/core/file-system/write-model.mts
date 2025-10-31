import {
  promises as fs,
} from 'node:fs';
import {
  dirname,
} from 'node:path';
import type {
  Context,
} from '../../context.mjs';
import type {
  RetrievedDependencyModel,
} from '../manifest/extract-dependency-models.mjs';

/**
 * Write the model file in the dependencies folder.
 * @param retrievedModel
 * @param context
 */
export const writeModelFile = async (retrievedModel: RetrievedDependencyModel, context: Context) => {
  const { outputFilePath, content } = retrievedModel;
  const { logger } = context;
  const directory = dirname(outputFilePath);
  try {
    logger?.debug?.(`Creating directory for model file at ${directory}`);
    await fs.mkdir(directory, { recursive: true });
  } catch {
    logger?.debug?.(`Directory ${directory} may already exist, continuing...`);
  }

  await fs.writeFile(outputFilePath, content, { encoding: 'utf8' });
};
