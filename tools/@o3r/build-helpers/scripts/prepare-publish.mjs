/*
 * The purpose of this script is to prepare the artifact to be published on registries
 * This includes the following steps:
 *   - Duplicate selected field from the root folder package.json to targeted package.json(default: 'contributors', 'bugs', 'repository', 'license')
 *   - Copy License file
 */

import minimist from 'minimist';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const argv = minimist(process.argv.slice(2));
const root = argv.root ? resolve(process.cwd(), argv.root) : process.cwd();
const /** @type { string[] } */ fields = argv.fields?.split(',') || ['contributors', 'bugs', 'repository', 'license'];

/**
 * Find Private package.json
 *
 * @param {string} currentFolder
 */
const findPrivatePackage = (currentFolder) => {
  const inspectedPackage = resolve(currentFolder, 'package.json');
  if (existsSync(inspectedPackage)) {
    const pck = JSON.parse(readFileSync(inspectedPackage, {encoding: 'utf-8'}));
    if (pck.private) {
      return {
        content: pck,
        path: inspectedPackage
      };
    }
  }

  const parent = dirname(currentFolder);
  if (!parent || currentFolder === parent) {
    return null;
  }
  return findPrivatePackage(parent);
};

/**
 * Update package.json, copy README.md and LICENCE into dist folder
 *
 * @param {string} root
 * @param {string} distPath
 * @param {string} packageJsonPath
 */
function preparePublish(root, distPath, packageJsonPath) {
  const privatePackageJson = findPrivatePackage(root);
  const distPackageJson = resolve(root, packageJsonPath);

  if (!packageJsonPath || !existsSync(distPackageJson)) {
    throw new Error(`No package.json found for ${distPackageJson}`);
  }
  if (!privatePackageJson) {
    throw new Error('No private package.json found');
  }

  const packageJson = JSON.parse(readFileSync(distPackageJson, {encoding: 'utf-8'}));

  if (!existsSync(resolve(distPath, 'README.md'))) {
    if (existsSync(resolve(root, 'README.md'))) {
      copyFileSync(resolve(root, 'README.md'), resolve(distPath, 'README.md'));
    } else {
      throw new Error(`no README.md file available for ${packageJson.name}`);
    }
  }

  fields.forEach((field) => {
    packageJson[field] = privatePackageJson.content[field];
  });

  writeFileSync(distPackageJson, JSON.stringify(packageJson, null, 2));
  copyFileSync(resolve(dirname(privatePackageJson.path), 'LICENSE'), resolve(distPath, 'LICENSE'));

  const readmeBasePath = resolve(process.cwd(), 'README.md');
  const readmeDistPath = resolve(distPath, 'README.md');
  if (!existsSync(readmeDistPath)) {
    if (!existsSync(readmeBasePath)) {
      console.warn(`No README.md file found at ${readmeBasePath}`);
    } else {
      copyFileSync(readmeBasePath, readmeDistPath);
    }
  }
}

const distPaths = argv._[0] ? argv._ : [resolve(process.cwd(), 'dist')];
distPaths.forEach((distPath) => preparePublish(root, distPath, join(distPath, 'package.json')));
