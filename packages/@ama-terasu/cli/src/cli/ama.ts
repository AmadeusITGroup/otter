#!/usr/bin/env node

import * as prompts from 'prompts';
import { amaYargs } from '../modules/base-yargs';
import * as minimist from 'minimist';

void (async () => {
  const override = await amaYargs(minimist(process.argv.slice(2)));
  return (prompts as any).override(override.argv);
})();
