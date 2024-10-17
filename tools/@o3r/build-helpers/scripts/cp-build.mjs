/*
 * The purpose of this script is to copy files from the temporary build folder
 */

import { globby as glob } from 'globby';
import minimist from 'minimist';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';

const argv = minimist(process.argv.slice(2));
const cwd = argv.root ? path.resolve(process.cwd(), argv.root) : process.cwd();
const buildFolder = path.resolve(cwd, 'build');

const outDir = path.resolve(cwd, argv.outDir || 'dist');

void (async () => {
  const files = await glob('{builders,schematics}/**', { cwd: buildFolder });
  await Promise.all(files.map(async (file) => {
    try {
      await fs.mkdir(path.dirname(path.resolve(outDir, file)), { recursive: true });
    } catch {}
    return fs.copyFile(path.resolve(buildFolder, file), path.resolve(outDir, file));
  }));
})();
