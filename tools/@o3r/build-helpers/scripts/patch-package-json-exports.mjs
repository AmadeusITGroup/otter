#!/usr/bin/env node
/*
 * The purpose of this script is to remove the dist/ part of the path in a "main", "types" and "typing" field of the package.json
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

const packageJsonPath = join(root, 'dist', 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, { encoding: 'utf8' }));

const srcPrefixRegExp = /^\.\/src\//;
const distPrefixRegExp = /^\.\/dist\//;

if (!packageJson.exports) {
  process.exit(0);
}

packageJson.exports = Object.entries(packageJson.exports)
  .reduce((acc, [exportPath, value]) => {
    const newPath = exportPath.replace(srcPrefixRegExp, './');
    return {
      ...acc,
      [newPath]: typeof value === 'object'
        ? Object.fromEntries(Object.entries(value).map(([exportType, outputPath]) =>
          [exportType, outputPath.replace(distPrefixRegExp, './')]
        ))
        : value
    };
  }, {});

writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
