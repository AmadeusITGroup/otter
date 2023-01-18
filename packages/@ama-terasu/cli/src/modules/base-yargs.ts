/* eslint-disable no-use-before-define */
import { AmaCliModule, yargsAmaCli } from '@ama-terasu/core';
import * as chalk from 'chalk';
import { existsSync, readFileSync } from 'node:fs';
import { error } from 'loglevel';
import { EOL } from 'node:os';
import { resolve } from 'node:path';
import { terminalWidth } from 'yargs';
import { cliModules, dependencies } from '../../package.json';
import { formatHelpMessage, getCliModules, getPackageFormattedVersion, getPackageVersion } from '../helpers/index';
import { baseContext, generateUsageMessage } from './base-context';

/** Module registered to Amaterasu CLI */
const modules = getCliModules(cliModules, dependencies);

const baseYargs = yargsAmaCli
  .scriptName('@ama-terasu/cli')
  .usage(generateUsageMessage('<module>', '<commands...>'))
  .demandCommand()
  .wrap(Math.min(terminalWidth(), 150))
  .version(getPackageVersion(cliModules))
  .help(false)
  .config('config', 'Path to a JSON configuration file', (configPath) => {
    const fullPath = resolve(process.cwd(), configPath);
    if (existsSync(fullPath)) {
      return JSON.parse(readFileSync(fullPath, 'utf-8'));
    } else {
      throw new Error('Configuration file not found');
    }
  })
  .option('help', {
    alias: ['h'],
    description: 'Show help',
    type: 'boolean'
  })
  .group(['help', 'version'], 'Information:')
  .group(['yes', 'verbose', 'config'], 'Common:')
  .middleware(async (arg) => {
    if (arg.help || arg.h) {
      await baseContext.showHelpMessage(baseYargs, arg);
    }
  })
  .showHelpOnFail(false, `Use option ${chalk.grey('--help')} to display command usage`)
  .fail(async (errorMessage, err) => {
    const message = await amaYargs.getHelp();
    const arg = await amaYargs.argv;

    if (!arg.help) {
      if (errorMessage) {
        error(`${EOL}${chalk.red('Error: ')}${errorMessage}${EOL}`);
      } else {
        error(EOL);
        error(err);
        process.exit(1);
      }
    }

    error(formatHelpMessage(message, arg));
    process.exit(0);
  });

/**
 * Yargs instance configured with Amaterasu options and loaded moduLes
 */
export const amaYargs = modules.reduce((acc, moduleName) => {
  const mod: AmaCliModule = require(moduleName);
  const version = getPackageFormattedVersion(moduleName);
  return acc
    .command(mod.name, mod.description, (y) =>
      mod.init((version ? y.version(version) : y).usage(generateUsageMessage(mod.name, '<commands...>')), baseContext)
    );
}, baseYargs);
