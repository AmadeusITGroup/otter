import {
  promises as fs,
} from 'node:fs';
import {
  resolve,
} from 'node:path';
import {
  OUTPUT_DIRECTORY,
} from '../../constants.mjs';

/**
 * Clean the dependency output directory
 * @param cwd
 */
export const cleanOutputDirectory = (cwd: string) => {
  return fs.rm(resolve(cwd, OUTPUT_DIRECTORY), { force: true, recursive: true });
};
