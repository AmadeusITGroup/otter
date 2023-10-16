/*
 * Generate a basic package.json file, in the specific folders, with explicity type defined to 'commonjs'
 */

import { globby as glob } from 'globby';
import minimist from 'minimist';
import { promises as fs, existsSync } from 'node:fs';
import * as path from 'node:path';

const argv = minimist(process.argv.slice(2));

const cwd = argv.root ? path.resolve(process.cwd(), argv.root) : process.cwd();

const outDir = path.resolve(cwd, argv.outDir || 'dist/');
const /** @type {string[]} */ folders = (argv._?.length > 0 ? argv._ : ['schematics', 'builders', 'cli']).map((folder) => path.resolve(outDir, folder));

void (async () => {
  const promises = folders.map(async (folder) => {
    const packageJsonPath = path.resolve(folder, 'package.json');
    if (!existsSync(folder)) {
      return;
    }

    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, {encoding: 'utf8'}));
      if (packageJson.type && !/commonjs/i.test(packageJson.type)) {
        throw new Error(`The file ${packageJsonPath} already exists and has a different type`);
      }
      packageJson.type = 'commonjs';
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))
    } else {
      await fs.writeFile(packageJsonPath, JSON.stringify({type: 'commonjs'}, null, 2))
    }
  });

  await Promise.all(promises);
})();
