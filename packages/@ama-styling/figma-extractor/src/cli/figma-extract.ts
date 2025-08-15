#!/usr/bin/env node
import {
  env,
} from 'node:process';
import * as yargs from 'yargs';
import {
  hideBin,
} from 'yargs/helpers';
import {
  DEFAULT_FILENAME_MATCHER,
} from '../core/requests/get-versions.request';
import {
  generateJsonFiles,
} from '../public_api';

void yargs(hideBin(process.argv))
  .option('accessToken', {
    alias: 'a',
    type: 'string',
    description: 'Access Token to read the Figma File information',
    default: env.FIGMA_TOKEN
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    description: 'Folder to extract the Design Token to',
    default: env.FIGMA_OUTPUT || './design-token'
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Determine if the logger display debug messages',
    default: false
  })
  .option('quiet', {
    alias: 'q',
    type: 'boolean',
    description: 'Determine if it should ignore message in the console',
    default: false
  })
  .option('name', {
    alias: 'n',
    type: 'string',
    description: 'Name of the Design Token collection',
    default: env.FIGMA_DT_NAME || 'Design Tokens'
  })
  .option('generatePackage', {
    alias: 'p',
    type: 'boolean',
    description: 'Request the generation of the NPM Package',
    default: false
  })
  .option('packageName', {
    type: 'string',
    description: 'Version of the Design Token collection (if not provided, the `name` option value will be used)'
  })
  .command('extract-file [fileKey]', 'Extract file Design Token', (yargsExtract) => {
    return yargsExtract
      .positional('fileKey', {
        type: 'string',
        describe: 'File Key of the Figma file to extract',
        default: env.FIGMA_FILE_KEY
      });
  }, (argv) => {
    if (!argv.accessToken) {
      throw new Error('Should provide Access Token.');
    }
    if (!argv.fileKey) {
      throw new Error('File key is mandatory.');
    }

    // eslint-disable-next-line no-console -- Logging for CLI
    const logger = argv.quiet ? undefined : { ...console, debug: argv.verbose ? console.debug : undefined };
    return generateJsonFiles({
      accessToken: argv.accessToken,
      fileKey: argv.fileKey,
      output: argv.output,
      name: argv.name,
      packageName: argv.packageName,
      generatePackage: argv.generatePackage,
      logger
    });
  })
  .command('extract-project [projectKey]', 'Extract the design token of the latest version of a dedicated project', (yargsExtract) => {
    return yargsExtract
      .option('filenamePattern', {
        alias: 'P',
        description: 'Pattern of the filename, capturing its version, to match in the project',
        default: env.FIGMA_PROJECT_FILENAME_MATCHER || DEFAULT_FILENAME_MATCHER,
        type: 'string'
      })
      .option('versionRange', {
        alias: 'R',
        description: 'Restricted range of versions of the File to be considered',
        type: 'string'
      })
      .positional('projectKey', {
        describe: 'Figma Project Key where is the file to extract',
        type: 'string',
        default: env.FIGMA_PROJECT_KEY
      });
  }, (argv) => {
    if (!argv.accessToken) {
      throw new Error('Should provide Access Token.');
    }
    if (!argv.projectKey) {
      throw new Error('File key is mandatory.');
    }

    // eslint-disable-next-line no-console -- Logging for CLI
    const logger = argv.quiet ? undefined : { ...console, debug: argv.verbose ? console.debug : undefined };
    return generateJsonFiles({
      accessToken: argv.accessToken,
      projectKey: argv.projectKey,
      output: argv.output,
      name: argv.name,
      packageName: argv.packageName,
      generatePackage: argv.generatePackage,
      versionRange: argv.versionRange,
      logger
    });
  })
  .parse();
