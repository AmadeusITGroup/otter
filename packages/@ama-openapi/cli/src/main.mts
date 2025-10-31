#!/usr/bin/env node

/* eslint-disable no-console -- required for CLI feedback */

import type {
  Logger,
} from '@ama-openapi/core';
import yargs from 'yargs';
import {
  hideBin,
} from 'yargs/helpers';

void yargs(hideBin(process.argv))
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
    // eslint-disable-next-line import/no-unresolved -- Cannot resolve mjs file in current setup
    const { installDependencies } = await import('@ama-openapi/core');
    try {
      const logger = args.silent ? undefined : { ...console, debug: args.debug ? console.debug : undefined } satisfies Logger;
      await installDependencies(process.cwd(), { logger });
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  })
  .command('watch', 'Watch and install the OpenAPI specifications from manifest files on changes', () => {}, async (args) => {
    // eslint-disable-next-line import/no-unresolved -- Cannot resolve mjs file in current setup
    const { DEFAULT_MANIFEST_FILENAMES, installDependencies } = await import('@ama-openapi/core');
    const { watch } = await import('chokidar');
    const logger = args.silent ? undefined : { ...console, debug: args.debug ? console.debug : undefined } satisfies Logger;

    return new Promise<void>((_resolve, reject) => {
      watch([...DEFAULT_MANIFEST_FILENAMES], { awaitWriteFinish: true, ignoreInitial: false, cwd: process.cwd() })
        .on('all', async (path) => {
          logger?.info(`Detected change in ${path}. Installing dependencies...`);
          try {
            await installDependencies(process.cwd(), { logger });
          } catch (e) {
            logger?.error('Error during installation: ', e);
          }
        })
        .on('error', (error) => {
          logger?.error('Watcher error: ', error);
          reject(error as Error);
        });
    });
  })
  .parse();
