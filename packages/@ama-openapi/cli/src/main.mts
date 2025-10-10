#!/usr/bin/env node
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
  .command('install', 'Install the OpenAPI specifications from manifest files', undefined, async (args) => {
    const { installDependencies } = await import('@ama-openapi/core');
    await installDependencies(process.cwd(), { addGitIgnore: args.ignore, logger: args.silent ? undefined : console });
  })
  .parse();
