#!/usr/bin/env node

/* eslint-disable no-console -- required for CLI feedback */

import {
  existsSync,
} from 'node:fs';
import {
  rm,
} from 'node:fs/promises';
import {
  resolve,
} from 'node:path';
import {
  DEFAULT_MANIFEST_FILENAMES,
  DEFAULT_SCHEMA_OUTPUT_DIRECTORY,
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
        default: DEFAULT_SCHEMA_OUTPUT_DIRECTORY,
        alias: 'o',
        description: 'Output directory where generating the schemas'
      })
      .option('keywords', {
        type: 'string',
        array: true,
        alias: 'k',
        default: OPENAPI_NPM_KEYWORDS,
        description: 'List of NPM Keywords to use when searching for packages exposing OpenAPI specifications'
      })
      .option('clean', {
        type: 'boolean',
        alias: 'c',
        default: false,
        description: 'Clean the output directory before generating the schemas'
      });
  }, async (args) => {
    const logger = args.logLevel === 'silent' ? undefined : getLogger(args.logLevel as LogLevel, console);
    try {
      const outputDirectory = args.output;
      const outputDirectoryPath = resolve(process.cwd(), outputDirectory);

      if (args.clean && existsSync(outputDirectoryPath)) {
        logger?.info(`Cleaning output directory "${outputDirectory}"...`);
        await rm(outputDirectoryPath, { recursive: true, force: true });
      }

      await generateValidationSchemaFiles(process.cwd(), { logger, outputDirectory, keywordsWhitelist: args.keywords.map(String) });
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
