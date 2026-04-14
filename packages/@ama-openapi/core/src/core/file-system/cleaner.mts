import {
  promises as fs,
} from 'node:fs';
import {
  resolve,
} from 'node:path';
import {
  OUTPUT_DIRECTORY,
} from '../../constants.mjs';
import type {
  Context,
} from '../../context.mjs';

/**
 * Clean the dependency output directory
 * @param context
 */
export const cleanOutputDirectory = (context: Context) => {
  const { cwd, logger } = context;
  const outputDirectory = resolve(cwd, OUTPUT_DIRECTORY);
  logger?.debug?.(`Removing directory ${outputDirectory}`);
  return fs.rm(outputDirectory, { force: true, recursive: true });
};
