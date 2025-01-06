#!/usr/bin/env node
import * as minimist from 'minimist';
import { getPreviousVersion } from './get-previous-version.cjs';
import { isLatest } from './is-latest.cjs';

const argv = minimist(process.argv.slice(2));
const cmd = argv._.at(0);

if (cmd === 'previous-version') {
  void getPreviousVersion(argv._.at(1));
} else if (cmd === 'is-latest') {
  void isLatest(argv._.at(1));
} else {
  throw new Error(`Unknown command ${cmd}`)
}
