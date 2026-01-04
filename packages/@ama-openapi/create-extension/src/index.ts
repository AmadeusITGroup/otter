#!/usr/bin/env node

import {
  promises as fs,
} from 'node:fs';
import {
  resolve,
} from 'node:path';
import {
  OUTPUT_DIRECTORY,
  // eslint-disable-next-line import/no-unresolved -- Cannot resolve mjs file in current setup (see #3738)
} from '@ama-openapi/core';
import type {
  PackageJson,
} from 'type-fest';
import * as yargs from 'yargs';
import {
  hideBin,
} from 'yargs/helpers';
import {
  type CreateExtensionOptions,
  generateExtension,
} from './generate-template';

void (async () => {
  const version = (JSON.parse(await fs.readFile(resolve(__dirname, '..', 'package.json'), { encoding: 'utf8' })) as PackageJson).version!;
  const { name, target, dependencyBaseSpec } = await yargs(hideBin(process.argv))
    .option('target', {
      alias: 't',
      type: 'string',
      description: 'Target directory to generate the files into',
      default: process.cwd()
    })
    .option('dependencyBaseSpec', {
      type: 'string',
      alias: 'b',
      demandOption: false,
      describe: 'Name of the NPM artifact to use as the dependency base specification (e.g. @my-org/specification)'
    })
    .command('* <name>', 'Create a new OpenAPI extension project.')
    .positional('name', {
      type: 'string',
      demandOption: true,
      description: 'Name of the artifact / package to generate'
    })
    .usage('Usage: npm create @ama-openapi/extension <name> -- [options]')
    .version(version)
    .alias('h', 'help')
    .alias('v', 'version')
    .parse();

  const options: CreateExtensionOptions = {
    target,
    externalModelPath: OUTPUT_DIRECTORY,
    version,
    packageName: name,
    dependencyBaseSpec,
    logger: console
  };
  await generateExtension(options);
})();
