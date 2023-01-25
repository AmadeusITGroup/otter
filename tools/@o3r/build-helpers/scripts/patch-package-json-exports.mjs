/*
 * The purpose of this script is to remove the dist/ part of the path in a "main", "types" and "typing" field of the package.json
 */

import minimist from 'minimist';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const argv = minimist(process.argv.slice(2));
const root = argv.root ? resolve(process.cwd(), argv.root) : process.cwd();

const packageJsonPath = join(root, 'dist', 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, {encoding: 'utf-8'}));

const srcPrefixRegExp = /^\.\/src\//;

if (!packageJson.exports) {
  process.exit(0);
}

packageJson.exports = Object.entries(packageJson.exports)
  .reduce((acc, [exportPath, value]) => {
    const newPath = exportPath.replace(srcPrefixRegExp, './');
    return { ...acc, [newPath]: value };
  }, {});

writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
