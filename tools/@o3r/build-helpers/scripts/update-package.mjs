/*
 * The purpose of this script is to update a properties of a package.json
 * @example
 * yarn update-package ./package.json --name @new/name --version 1.0.0
 */

import fs from 'node:fs';
import path from 'node:path';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));
const packageJsonPath = path.resolve(process.cwd(), argv._[0]);
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, {encoding: 'utf-8'}));


Object.entries(argv)
  .filter((item) => item[0] !== '_')
  .forEach((item) => {
    const paths = item[0].split('.');
    const field = paths.pop();
    const refPackageField = paths.reduce((packageJsonDeep, p) => packageJsonDeep[p] ||= {}, packageJson);
    refPackageField[field] = item[1];
  });

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), {encoding: 'utf-8'});
