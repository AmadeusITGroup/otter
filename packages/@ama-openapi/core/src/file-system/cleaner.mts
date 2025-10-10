import {
  promises as fs,
} from 'node:fs';
import type {
  Manifest,
} from '../public_api.mjs';

/**
 * Clean the dependency output directory
 * @param manifest
 * @returns
 */
export const cleanOutputDirectory = (manifest: Manifest) => {
  return fs.rm(manifest.dependencyOutput, { force: true, recursive: true });
};
