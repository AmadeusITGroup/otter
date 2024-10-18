#!/usr/bin/env node

import * as minimist from 'minimist';
import * as prompts from 'prompts';
import {
  amaYargs
} from '../modules/base-yargs';

void (async () => {
  const override = await amaYargs(minimist(process.argv.slice(2)));
  return (prompts as any).override(override.argv);
})();
