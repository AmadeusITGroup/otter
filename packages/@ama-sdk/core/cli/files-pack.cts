#!/usr/bin/env node

/*
 * Update the Typescript SDK Package to expose the sub modules
 */

import { copyFileSync, mkdirSync } from 'node:fs';
import * as minimist from 'minimist';
import * as path from 'node:path';
import { promises as fs } from 'node:fs';
import * as globby from 'globby';
import type { PackageJson } from 'type-fest';

const argv = minimist(process.argv.slice(2));
const distFolder = argv.dist || 'dist';
const baseDir = argv.cwd && path.resolve(process.cwd(), argv.cwd) || process.cwd();
const posixBaseDir = path.posix.join(...baseDir.split(path.sep));
const {watch, noExports} = argv;

const files = [
  {glob: 'README.md', cwdForCopy: baseDir},
  {glob: 'LICENSE', cwdForCopy: baseDir},
  {glob: 'package.json', cwdForCopy: baseDir},
  {glob: 'src/**/package.json', cwdForCopy: path.join(baseDir, 'src')}
];

/**  Update package.json exports */
const updateExports = async () => {
  const packageJson = JSON.parse(await fs.readFile(path.join(baseDir, 'package.json'), { encoding: 'utf8' }));
  const packageJsonFiles = globby.sync(path.posix.join(posixBaseDir, distFolder, '*', '**', 'package.json'), {absolute: true});
  packageJson.exports = packageJson.exports || {};
  for (const packageJsonFile of packageJsonFiles) {
    try {
      const subPackageJson = JSON.parse(await fs.readFile(packageJsonFile, { encoding: 'utf8' })) as PackageJson;
      const folder = './' + path.relative(path.join(baseDir, distFolder), path.dirname(packageJsonFile)).replace(/[/\\]+/g, '/');
      packageJson.exports[folder] = packageJson.exports[folder] || {};
      Object.entries(subPackageJson).forEach(([key, value]) => {
        if (['name', 'sideEffects'].includes(key)) {
          return;
        }
        packageJson.exports[folder][key] = './' + path.relative(path.join(baseDir, distFolder), path.resolve(path.dirname(packageJsonFile), value as string)).replace(/[/\\]+/g, '/');
      });
      packageJson.exports[folder].import = packageJson.exports[folder].module || packageJson.exports[folder].esm2020 || packageJson.exports[folder].esm2015 || packageJson.exports[folder].node;
      packageJson.exports[folder].require = packageJson.exports[folder].node;
      packageJson.exports[folder].main = packageJson.exports[folder].import || packageJson.exports[folder].require;
    } catch (e) {
      if (watch) {
        console.warn(`Exception in ${packageJsonFile}`, e);
      } else {
        throw e;
      }
    }
  }
  delete packageJson.scripts;
  await fs.writeFile(path.join(baseDir, distFolder, 'package.json'), JSON.stringify(packageJson, null, 2));
};

void (async () => {

  const copyToDist = (file: string, cwdForCopy: string) => {
    const distFile = path.resolve(baseDir, distFolder, path.relative(cwdForCopy, file));
    // eslint-disable-next-line no-console
    console.log(`${file} copied to ${distFile}`);
    try {
      mkdirSync(path.dirname(distFile), {recursive: true});
    } catch { /* ignore error */ }
    return copyFileSync(file, distFile);
  };

  // Move files into the dist folder
  const copies = files.map(async ({glob, cwdForCopy}) => {
    return watch ?
      import('chokidar')
        .then((chokidar) => chokidar.watch(path.posix.join(posixBaseDir, glob)))
        .then((watcher) => watcher.on('all', (event, file) => {
          if (event !== 'unlink' && event !== 'unlinkDir') {
            copyToDist(file, cwdForCopy);
            return updateExports();
          }
        })) :
      globby.sync(path.posix.join(posixBaseDir, glob))
        .forEach((file) => copyToDist(file, cwdForCopy));
  });
  await Promise.all(copies);

  // Edit package.json exports
  if (!noExports && !watch) {
    await updateExports();
  }
})();
