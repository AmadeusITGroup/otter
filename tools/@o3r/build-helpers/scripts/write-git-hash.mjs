/*
 * The purpose of this script is to add the git commit hash in package.json
 */

import minimist from 'minimist';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const commitHash = process.env.GITHUB_SHA;
if (!commitHash) {
  console.error('GITHUB_SHA environment variable is not found. The git hash will not be added to the package.json file.');
  process.exit(0);
}

const argv = minimist(process.argv.slice(2));
const root = argv.root ? resolve(process.cwd(), argv.root) : process.cwd();

const packageJsonPath = join(root, 'dist', 'package.json');


try {
  const data = readFileSync(packageJsonPath, { encoding: 'utf-8' });
  const packageJson = JSON.parse(data);

  packageJson.o3rConfig = packageJson.o3rConfig || {};
  packageJson.o3rConfig.commitHash = commitHash;

  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), { encoding: 'utf-8' });
  console.log(`package.json updated successfully with commit hash '${commitHash}'`);
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
