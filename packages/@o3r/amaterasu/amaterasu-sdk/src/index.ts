import {
  AmaCliModule,
  EXTRA_COMMON_OPTIONS,
  MODULE_OPTIONS
} from '@ama-terasu/core';
import {
  createTypescriptSdk
} from './create-typescript.command';

const name = 'sdk';

module.exports = {
  name,
  description: 'Commands relative to the SDK generation',
  init: (yargs, baseContext) => {
    return yargs
      .demandCommand()
      .command('create', 'Generate new SDK package', (yargsInstance) => yargsInstance
        .demandCommand()
        .option(EXTRA_COMMON_OPTIONS.path, {
          ...MODULE_OPTIONS.path,
          type: 'string',
          default: '.',
          description: 'Path to the generated package'
        })
        .command('typescript <name>', 'Generate a typescript SDK package (empty if no specification given)', (yargsInstanceTs) => yargsInstanceTs
          .positional('name', {
            type: 'string',
            description: 'Generated SDK scope name',
            demandOption: 'SDK name is mandatory'
          })
          .option(EXTRA_COMMON_OPTIONS.yarn, {
            ...MODULE_OPTIONS.yarn,
            type: 'boolean',
            default: true
          })
          .option('specification', {
            type: 'string',
            alias: ['S'],
            description: 'Path to the specification used to generate the SDK'
          }),
        (options) => createTypescriptSdk(baseContext.getContext(options), options)
        )
      );
  }
} as AmaCliModule;
