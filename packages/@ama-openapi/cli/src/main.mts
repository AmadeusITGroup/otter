#!/usr/bin/env node

/* eslint-disable no-console -- required for CLI feedback */

import {
  DEFAULT_MANIFEST_FILENAMES,
  generateValidationSchemaFiles,
  getLogger,
  installDependencies,
  type LogLevel,
  OPENAPI_NPM_KEYWORDS,
  // eslint-disable-next-line import/no-unresolved -- Cannot resolve mjs file in current setup (see #3738)
} from '@ama-openapi/core';
import yargs from 'yargs';
import {
  hideBin,
} from 'yargs/helpers';

/** Log levels for logger */
const logLevels = ['silent', 'error', 'warn', 'info', 'debug'] as const satisfies LogLevel[];

void yargs(hideBin(process.argv))
  .option('log-level', {
    type: 'string',
    alias: 'l',
    choices: logLevels,
    description: 'Determine the level of logs to display',
    default: 'error'
  })

  .command('generate-schema', 'Generate the schema that can be used for configuration auto completion', (yargsInstance) => {
    return yargsInstance
      .option('output', {
        type: 'string',
        alias: 'o',
        description: 'Output directory where generating the schemas'
      })
      .option('keywords', {
        type: 'string',
        array: true,
        alias: 'k',
        default: OPENAPI_NPM_KEYWORDS,
        description: 'List of NPM Keywords to use when searching for packages exposing OpenAPI specifications'
      });
  }, async (args) => {
    const logger = args.logLevel === 'silent' ? undefined : getLogger(args.logLevel as LogLevel, console);
    try {
      await generateValidationSchemaFiles(process.cwd(), { logger, outputDirectory: args.output, keywordsWhitelist: args.keywords.map(String) });
    } catch (e) {
      (logger?.error ?? console.error)(e);
      process.exit(1);
    }
  })

  .command('install', 'Install the OpenAPI specifications from manifest files', () => {}, async (args) => {
    const logger = args.logLevel === 'silent' ? undefined : getLogger(args.logLevel as LogLevel, console);
    try {
      await installDependencies(process.cwd(), { logger });
    } catch (e) {
      (logger?.error ?? console.error)(e);
      process.exit(1);
    }
  })

  .command('watch', 'Watch and install the OpenAPI specifications from manifest files on changes', () => {}, async (args) => {
    const { watch } = await import('chokidar');
    const logger = args.logLevel === 'silent' ? undefined : getLogger(args.logLevel as LogLevel, console);

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

  .strictCommands()
  .parse();
