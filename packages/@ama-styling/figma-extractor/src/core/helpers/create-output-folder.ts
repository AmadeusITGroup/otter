import {
  mkdir,
} from 'node:fs/promises';
import type {
  FigmaFileContext,
} from '../interfaces';

/**
 * Create output folder if it does not exist
 * @param output path to the output folder
 * @param options Options
 */
export const createOutputFolder = async (output: string, options?: Pick<FigmaFileContext, 'logger'>) => {
  try {
    await mkdir(output, { recursive: true });
  } catch (e) {
    options?.logger?.debug?.(`Fail to create ${output} because it already exists`, e);
  }
};
