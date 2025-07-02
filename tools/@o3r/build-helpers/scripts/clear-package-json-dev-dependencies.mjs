/*
 * The purpose of this script is remove the devDependency field from a package.json
 */

import {
  readFileSync,
  writeFileSync,
} from 'node:fs';
import {
  join,
  resolve,
} from 'node:path';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));
const root = argv.root ? resolve(process.cwd(), argv.root) : process.cwd();

const distPaths = argv._.length > 0
  ? argv._
  : [resolve(root, 'dist')];

distPaths.forEach((distPath) => {
  const packageJsonPath = join(distPath, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, { encoding: 'utf8' }));
  delete packageJson.devDependencies;
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
});
