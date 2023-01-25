/*
 * The purpose of this script duplicate selected field from the root folder package.json to targeted package.json
 * This is mainly used to populate contributors, bugs, repository fields to the package.json to publish (within the dist/ folder)
 */

import minimist from 'minimist';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const argv = minimist(process.argv.slice(2));
const root = argv.root ? resolve(process.cwd(), argv.root) : process.cwd();
const /** @type { string[] } */ fields = argv.fields?.split(',') || ['contributors', 'bugs', 'repository', 'license'];
const /** @type { string } */ packageJsonPath = argv._[0];

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
      return pck;
    }
  }

  const parent = dirname(currentFolder);
  if (!parent || currentFolder === parent) {
    return null;
  }
  return findPrivatePackage(parent);
};

const privatePackageJson = findPrivatePackage(root);
const distPackageJson = resolve(root, packageJsonPath);

if (!packageJsonPath || !existsSync(distPackageJson)) {
  throw new Error('No package.json found');
}
if (!privatePackageJson) {
  throw new Error('No private package.json found');
}

const packageJson = JSON.parse(readFileSync(distPackageJson, { encoding: 'utf-8' }));

fields.forEach((field) => {
  packageJson[field] = privatePackageJson[field];
});

writeFileSync(distPackageJson, JSON.stringify(packageJson, null, 2));
