/* eslint-disable no-shadow */
import { AmaCliModule, EXTRA_COMMON_OPTIONS, MODULE_OPTIONS } from '@ama-terasu/core';
import { createExtension } from './create-extension.command';

const name = 'dapi-spec';

module.exports = {
  name,
  description: 'Commands relative to the Digital Apis',
  init: (yargs, baseContext) => {
    return yargs
      .demandCommand()
      .command('create', 'Generate new Digital Api package', (yargsInstance) => yargsInstance
        .demandCommand()
        .option(EXTRA_COMMON_OPTIONS.path, {
          ...MODULE_OPTIONS.path,
          type: 'string',
          default: '.',
          description: 'Path to the generated package'
        })
        .option(EXTRA_COMMON_OPTIONS.azureToken, {
          ...MODULE_OPTIONS.azureToken,
          type: 'string',
          description: 'Azure registry Personal Access Token',
          demandOption: 'Azure registry PAT is mandatory'
        })
        .command('extension <name>', 'Generate a package of spec extension', (yargsInstanceExt) => yargsInstanceExt
          .positional('name', {
            type: 'string',
            description: 'Name of the extension specification',
            demandOption: 'Specification name is mandatory'
          })
          .option('type', {
            type: 'string',
            description: 'Digital Api type',
            choices: [
              'core-private',
              'core-public'
            ],
            default: 'core-private'
          })
          .option('spec-version', {
            type: 'string',
            description: 'Version of the spec to extend',
            default: '*'
          }),
        (options) => createExtension(baseContext.getContext(options), options)
        )
      );
  }
} as AmaCliModule;
