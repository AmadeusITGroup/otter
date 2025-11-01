import {
  promises as fs,
} from 'node:fs';
import {
  dirname,
} from 'node:path';
import type {
  RetrievedDependencyModel,
} from '../manifest/extract-dependency-models.mjs';

/**
 * Write the model file in the dependencies folder.
 * @param retrievedModel
 */
export const writeModelFile = async (retrievedModel: RetrievedDependencyModel) => {
  const { outputFilePath, content } = retrievedModel;
  try {
    await fs.mkdir(dirname(outputFilePath), { recursive: true });
  } catch {
    // ignore folder creation failure because it can be due to existing one. If not the next command will fail.
  }

  await fs.writeFile(outputFilePath, content, { encoding: 'utf8' });
};
