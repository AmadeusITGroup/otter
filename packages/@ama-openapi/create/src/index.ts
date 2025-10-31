#!/usr/bin/env node

import {
  promises as fs,
} from 'node:fs';
import {
  resolve,
} from 'node:path';
import {
  OUTPUT_DIRECTORY,
  // eslint-disable-next-line import/no-unresolved -- Cannot resolve mjs file in current setup
} from '@ama-openapi/core';
import type {
  PackageJson,
} from 'type-fest';
import * as yargs from 'yargs';
import {
  hideBin,
} from 'yargs/helpers';
import {
  type CreateOptions,
  generateTemplate,
} from './generate-template';

void (async () => {
  const version = (JSON.parse(await fs.readFile(resolve(__dirname, '..', 'package.json'), { encoding: 'utf8' })) as PackageJson).version!;
  await yargs(hideBin(process.argv))
    .option('target', {
      alias: 't',
      type: 'string',
      description: 'Target directory to generate the files into',
      default: process.cwd()
    })
    .command('design <name>', 'Name of the artifact / package to generate', (y) => {
      return y.positional('name', {
        type: 'string',
        demandOption: true,
        describe: 'Name of the artifact / package to generate'
      });
    }, async (argv) => {
      const options: CreateOptions = {
        target: argv.target,
        externalModelPath: OUTPUT_DIRECTORY,
        version,
        packageName: argv.name
      };
      await generateTemplate(options);
    })
    .version(version)
    .alias('h', 'help')
    .alias('v', 'version')
    .parse();
})();
