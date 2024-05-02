/*
 * The purpose of this script is to remove the dist/ part of the path in a "main", "types" and "typing" field of the package.json
 */

import minimist from 'minimist';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, posix, relative, resolve } from 'node:path';

const argv = minimist(process.argv.slice(2));
const root = argv.root ? resolve(process.cwd(), argv.root) : process.cwd();

const distFolder = 'dist';
const availableSourceExtension = ['js', 'cjs', 'mjs'];
const typeFields = ['types', 'typings'];
const srcFields = ['main', 'default', 'module', 'esm2015', 'esm2020', 'schematics', 'builders'];
const fields = [...typeFields,...srcFields];
const distPath = resolve(root, distFolder);
const packageJsonPath = join(distPath, 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, {encoding: 'utf-8'}));

const distPrefixRegExp = new RegExp(`^(\\.\\/)?${distFolder}\\/`);

/**
 * Update the Package.json field
 * @param field {string Name of the field
 * @param originalPath {string} Path to the file to target
 */
const updateField = (field, originalPath) => {
  const path = originalPath.replace(distPrefixRegExp, '$1');
  if (/\.ts$/.test(path) && !existsSync(resolve(distPath, path))) {
    if (srcFields.includes(field)) {
      const newSourcePath = availableSourceExtension
        .map((ext) => resolve(distPath, path.replace(/\.ts$/, `.${ext}`)))
        .find((newPath) => existsSync(newPath));
      if (newSourcePath) {
        return { field, path: './' + posix.normalize(relative(distFolder, newSourcePath)) };
      }
    } else if (typeFields.includes(field)) {
      const newTypePath = resolve(distPath, path.replace(/\.ts$/, '.d.ts'));
      if (existsSync(newTypePath)) {
        return { field, path: './' + posix.normalize(relative(distFolder, newTypePath)) };
      }
    }
  }
  return { field, path };
};

fields
  .filter((field) => packageJson[field])
  .map((field) => updateField(field, packageJson[field]))
  .forEach(({field, path}) => packageJson[field] = path);

if (packageJson.bin) {
  Object.keys(packageJson.bin)
    .forEach((cli) => packageJson.bin[cli] = updateField('cli', packageJson.bin[cli]).path);
}

if (packageJson.cmsMetadata) {
  Object.keys(packageJson.cmsMetadata)
    .forEach((metadataFile) => packageJson.cmsMetadata[metadataFile] = updateField('cmsMetadata', packageJson.cmsMetadata[metadataFile]).path);
}

if (packageJson['ng-update']?.migrations) {
  packageJson['ng-update'].migrations = updateField('ng-update', packageJson['ng-update'].migrations).path;
}

if (packageJson.exports) {
  Object.entries(packageJson.exports)
    .forEach(([key, paths]) => packageJson.exports[key] = Object.keys(paths)
      .reduce((acc, path) => {
        acc[path] = updateField(path, packageJson.exports[key][path]).path;
        return acc;
      }, {})
    );
}

writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
