import {
  existsSync,
  promises as fs,
} from 'node:fs';
import {
  EOL,
} from 'node:os';
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

  if (existsSync(outputFilePath)) {
    logger?.warn(`The file ${outputFilePath} already exist and will be replaced.`
      + `${EOL}This may be due to a previous model extraction, please verify or apply a "fileRename" value to the associated Transform.`);
  }

  await fs.writeFile(outputFilePath, content, { encoding: 'utf8' });
};
