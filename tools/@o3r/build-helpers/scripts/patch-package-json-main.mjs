/*
 * The purpose of this script is to remove the dist/ part of the path in a "main", "types" and "typing" field of the package.json
 */

import minimist from 'minimist';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const argv = minimist(process.argv.slice(2));
const root = argv.root ? resolve(process.cwd(), argv.root) : process.cwd();

const fields = ['main', 'types', 'typings', 'module', 'esm2015', 'esm2020', 'schematics', 'builders'];
const packageJsonPath = join(root, 'dist', 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, {encoding: 'utf-8'}));

const distPrefixRegExp = /^(\.\/)?dist\//;

fields
  .filter((field) => packageJson[field])
  .forEach((field) => packageJson[field] = packageJson[field].replace(distPrefixRegExp, './'));

if (packageJson.bin) {
  Object.keys(packageJson.bin)
    .forEach((cli) => packageJson.bin[cli] = packageJson.bin[cli].replace(distPrefixRegExp, ''));
}

if (packageJson.cmsMetadata) {
  Object.keys(packageJson.cmsMetadata)
    .forEach((metadataFile) => packageJson.cmsMetadata[metadataFile] = packageJson.cmsMetadata[metadataFile].replace(distPrefixRegExp, ''));
}

if (packageJson['ng-update']?.migrations) {
  packageJson['ng-update'].migrations = packageJson['ng-update']?.migrations.replace(distPrefixRegExp, '');
}

if (packageJson.exports) {
  Object.entries(packageJson.exports)
    .forEach(([key, paths]) => packageJson.exports[key] = Object.keys(paths)
      .reduce((acc, path) => {
        acc[path] = packageJson.exports[key][path].replace(distPrefixRegExp, './');
        return acc;
      }, {})
    );
}

writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
