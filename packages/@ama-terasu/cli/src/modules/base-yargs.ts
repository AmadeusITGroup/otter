import { AmaCliModule, yargsAmaCli } from '@ama-terasu/core';
import * as chalk from 'chalk';
import { existsSync, readFileSync } from 'node:fs';
import { error } from 'loglevel';
import { EOL } from 'node:os';
import { resolve } from 'node:path';
import { terminalWidth } from 'yargs';

import { formatHelpMessage, getPackageFormattedVersion, getPackageVersion } from '../helpers/index';
import { baseContext, generateUsageMessage } from './base-context';
import { getCliModules, getFormattedDescription, getInstalledInformation, installDependency, isInstalled } from '../helpers/module.helper';

export const amaYargs = async (argv?: Record<string, any>) => {

  /** Module registered to Amaterasu CLI */
  const modules = await getCliModules({ localOnly: !!argv?.['local-only'] });

  const baseYargs = yargsAmaCli
    .scriptName('@ama-terasu/cli')
    .usage(generateUsageMessage('<module>', '<commands...>'))
    .demandCommand()
    .wrap(Math.min(terminalWidth(), 150))
    .version(getPackageVersion(modules))
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
    .group(['yes', 'verbose', 'local-only', 'config'], 'Common:')
    .middleware(async (arg) => {
      if (arg.help || arg.h) {
        await baseContext.showHelpMessage(baseYargs, arg);
      }
    })
    .showHelpOnFail(false, `Use option ${chalk.grey('--help')} to display command usage`)
    .fail(async (errorMessage, err) => {
      const message = await yargsAmaCli.getHelp();
      const arg = await yargsAmaCli.argv;

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
    })
    .command('module', 'Manage the installed modules', (yargsInstance) => yargsInstance
      .demandCommand()
      .command('update <package>', 'Update a module version', () => yargsInstance
        .positional('package', {
          type: 'string',
          description: 'Name of the package to update',
          demandOption: 'Package name is mandatory'
        })
        .option('to', {
          type: 'string',
          description: 'Specific version to upgrade the dependency to'
        }), async (options) => {
        const moduleToUpdate = modules.find(({ name }) => name === options.package);
        if (!moduleToUpdate) {
          baseContext.logger.error(`Module ${options.package} not found`);
        } else {
          await baseContext.getSpinner(`Updating ${chalk.bold(moduleToUpdate.name)} module...`)
            .fromPromise(installDependency(moduleToUpdate, options.to), `${moduleToUpdate.name} has been installed`, `Failed to install ${moduleToUpdate.name} module`);
        }
      })
    );

  /**
   * Yargs instance configured with Amaterasu options and loaded moduLes
   */
  return modules
    .reduce((acc, mod) => {
      const version = getPackageFormattedVersion(mod);
      return acc
        .command(mod.moduleName, getFormattedDescription(mod), async (yargsInstance) => {
          if (!isInstalled(mod)) {
            await baseContext.getSpinner(`Installing ${chalk.bold(mod.name)} module...`).fromPromise(installDependency(mod), `${mod.name} has been installed`, `Failed to install ${mod.name} module`);
            const information = await getInstalledInformation(mod, true);
            Object.assign(mod, information);
            if (!isInstalled(mod)) {
              throw new Error(`Something went wrong with the installation of ${mod.name}`);
            }
          }
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          (require(mod.resolutionPath) as AmaCliModule).init((version ? yargsInstance.version(version) : yargsInstance).usage(generateUsageMessage(mod.moduleName, '<commands...>')), baseContext);
        }
        );
    }, baseYargs);
};
