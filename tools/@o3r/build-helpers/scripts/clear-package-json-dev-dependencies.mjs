/*
 * The purpose of this script is remove the devDependency field from a package.json
 */

import minimist from 'minimist';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const argv = minimist(process.argv.slice(2));
const root = argv.root ? resolve(process.cwd(), argv.root) : process.cwd();

const distPaths = argv._.length
  ? argv._
  : [resolve(root, appendPath || 'dist')];

distPaths.forEach((distPath) => {
  const packageJsonPath = join(distPath, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, { encoding: 'utf-8' }));
  delete packageJson.devDependencies;
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
})
