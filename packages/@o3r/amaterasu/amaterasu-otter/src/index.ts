/* eslint-disable no-shadow */
import { AmaCliModule, EXTRA_COMMON_OPTIONS, MODULE_OPTIONS } from '@ama-terasu/core';
import { createApplication } from './create-application.command';
import { createCustomApplication } from './create-custom-application.command';

const name = 'otter';

module.exports = {
  name,
  description: 'Commands relative to Otter framework',
  init: (yargs, baseContext) => {
    return yargs
      .option(EXTRA_COMMON_OPTIONS.yarn, {
        ...MODULE_OPTIONS.yarn,
        type: 'boolean'
      })
      .demandCommand()
      .command('create', 'Generate a new Otter based project', (yargsInstance) => yargsInstance
        .usage(baseContext.generateUsageMessage(name, 'create <command>'))
        .demandCommand()
        .option(EXTRA_COMMON_OPTIONS.path, {
          ...MODULE_OPTIONS.path,
          type: 'string',
          default: '.',
          description: 'Path to the generated application'
        })
        .option('otter-version', {
          alias: ['O'],
          type: 'string',
          default: 'latest',
          description: 'Version of the Otter generators to use',
          demandOption: 'Amadeus NPM registries token is mandatory'
        })
        .command('application <name>', 'Generate a new Otter based application', (yargsInstanceApp) => yargsInstanceApp
          .positional('name', {
            type: 'string',
            description: 'Application name',
            demandOption: 'Application name is mandatory'
          })
          .option('material', {
            type: 'boolean',
            default: true,
            description: 'Add material dependency'
          }),
        (options) => createApplication(baseContext.getContext(options), options)
        )
        .command('custom-application <airline>', 'Generate Otter custom application', (yargsInstanceCustomApp) => yargsInstanceCustomApp
          .positional('airline', {
            type: 'string',
            description: 'Airline code for the application',
            demandOption: 'Airline code is mandatory'
          })
          .option('flavour', {
            type: 'string',
            choices: ['booking', 'ssci', 'servicing', 'ndc'],
            description: 'RefX flavour',
            demandOption: 'RefX flavour selection is mandatory'
          })
          .option('tag', {
            type: 'string',
            default: '5.4.0',
            description: 'The git tag of the white label that is to be customized.'
          }),
        (options) => createCustomApplication(baseContext.getContext(options), options)
        )
      );
  }
} as AmaCliModule;
