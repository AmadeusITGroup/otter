#!/usr/bin/env node
import type { Logger } from '@ama-openapi/core';
import yargs from 'yargs';
import {
  hideBin,
} from 'yargs/helpers';

void yargs(hideBin(process.argv))
  .option('ignore', {
    alias: 'i',
    type: 'boolean',
    description: 'Generate a gitignore file to ignore the retrieved files',
    default: true
  })
  .option('silent', {
    type: 'boolean',
    description: 'Suppress all logs',
    default: false
  })
  .option('debug', {
    type: 'boolean',
    description: 'Display debug level logs',
    default: false
  })
  .command('install', 'Install the OpenAPI specifications from manifest files', () => {}, async (args) => {
    const { installDependencies } = await import('@ama-openapi/core');
    try {
      const logger = args.silent ? undefined : { ...console, debug: args.debug ? console.debug : undefined } satisfies Logger;
      await installDependencies(process.cwd(), { skipGitIgnore: !args.ignore, logger });
    } catch(e) {
      console.error(e);
      process.exit(1);
    }
  })
  .parse();
