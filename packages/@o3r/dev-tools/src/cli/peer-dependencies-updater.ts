#!/usr/bin/env node

import * as path from 'node:path';
import {
  program
} from 'commander';
import * as winston from 'winston';
import {
  updatePeerDependencies
} from '../utils/update-peer-dependencies';

const pathingCalculation = (value: string) => path.resolve(process.cwd(), value);

let dependencies: string[] = [];

program
  .arguments('[dependencies...]')
  .description('[DEPRECATED] Update the given packages version and their peer dependencies range in the provided package.json file (defaulted to local ./package.json)')
  .option('-p, --package-json <packageJson>', 'Path to the package.json file to update. Default: ./package.json', './package.json')
  .option('--verbose', 'Display debug log message')
  .option('--silent', 'Do not exit with error in case of metadata fetch error')
  .action((actionDependencies: string[] = []) => {
    dependencies = actionDependencies;
  })
  .parse(process.argv);

const opts = program.opts();

const logger = winston.createLogger({
  level: opts.verbose ? 'debug' : 'info',
  format: winston.format.simple(),
  transports: new winston.transports.Console()
});

logger.warn('This script is deprecated, will be removed in Otter v12.');

void (async () => {
  try {
    await updatePeerDependencies(dependencies, pathingCalculation(opts.packageJson), opts.verbose, opts.silent);
  } catch (e) {
    logger.error(e);
    process.exit(1);
  }
})();
