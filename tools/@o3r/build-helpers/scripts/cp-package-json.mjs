/*
 * The purpose of this script is to copy the package.json into the src/ folder for sub-entry purpose
 */

import {
  copyFileSync,
} from 'node:fs';
import {
  join,
  resolve,
} from 'node:path';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));
const root = argv.root ? resolve(process.cwd(), argv.root) : process.cwd();

copyFileSync(join(root, 'package.json'), join(root, 'src', 'package.json'));
