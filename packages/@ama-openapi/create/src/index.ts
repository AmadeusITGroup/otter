#!/usr/bin/env node

import {
  promises as fs,
} from 'node:fs';
import {
  resolve,
} from 'node:path';
import type {
  PackageJson,
} from 'type-fest';
import * as yargs from 'yargs';
import {
  hideBin,
} from 'yargs/helpers';
import {
  generateDesign,
} from './generate-design';
import {
  generateExtension,
} from './generate-extension';

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
      await generateDesign(argv.target, argv.name, version);
    })
    .command('extension <name>', 'Name of the artifact / package to generate', (y) => {
      return y
        .positional('name', {
          type: 'string',
          demandOption: true,
          describe: 'Name of the artifact / package to generate'
        })
        .option('dependencyBaseSpec', {
          type: 'string',
          alias: 'b',
          demandOption: false,
          describe: 'Name of the NPM artifact to use as the dependency base specification (e.g. @my-org/specification)'
        });
    }, async (argv) => {
      await generateExtension(argv.target, argv.name, version, argv.dependencyBaseSpec);
    })
    .version(version)
    .alias('h', 'help')
    .alias('v', 'version')
    .parse();
})();
