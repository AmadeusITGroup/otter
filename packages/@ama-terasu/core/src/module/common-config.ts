import yargs, { Arguments, Argv } from 'yargs';
import { hideBin } from 'yargs/helpers';

/** global CLI options */
export const yargsAmaCli = yargs(hideBin(process.argv))
  .options('yes', {
    global: true,
    alias: 'y',
    description: 'Skip the input interactive',
    type: 'boolean'
  })
  .version(false)
  .options('version', {
    alias: 'V',
    description: 'The modules versions',
    type: 'boolean'
  })
  .options('verbose', {
    global: true,
    description: 'Display the log in verbose mode',
    type: 'boolean'
  })
  .config('config', 'Path to the configuration file');

/** Type helper to retrieve configuration from module */
export type CommonOptions = (typeof yargsAmaCli) extends Argv<infer X> ? Arguments<X> : never;

/**
 * Module Option common default properties
 */
export interface DefaultOptions {
  /** @see import('yargs').Options.alias */
  alias?: string | string[];
  /** @see import('yargs').Options.description */
  description?: string;
}

/** List of common option/command name to align between the modules */
export const EXTRA_COMMON_OPTIONS = {
  /** @deprecated, will be removed in V9 */
  registryToken: 'registry-token',
  azureToken: 'azure-token',
  path: 'path',
  yarn: 'yarn'
} as const;

/** Common options */
// eslint-disable-next-line no-unused-vars
export const MODULE_OPTIONS: { [X in keyof typeof EXTRA_COMMON_OPTIONS]: DefaultOptions } = {
  /** @deprecated, will be removed in V9 */
  registryToken: {
    alias: 'T',
    description: 'NPM registry access token'
  },
  azureToken: {
    alias: 'A',
    description: 'Azure registry Personal Access Token'
  },
  path: {
    description: 'NPM registry access token'
  },
  yarn: {
    description: 'Use Yarn instead of NPM'
  }
};
