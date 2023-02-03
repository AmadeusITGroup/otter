#!/usr/bin/env node
import { program } from 'commander';
import {parse} from 'semver';
import * as winston from 'winston';
import {sanitizeChangeLogs} from '../helpers';

program
  .description('Triggers the change-log sanitizer')
  .requiredOption('--release-version <releaseVersion>', 'Version to create RC or final release for (x.y.z format)', (v) => (/^([0-9]+)\.([0-9]+)\.([0-9]+)$/.test(v) ? v : undefined))
  .option('--verbose', 'Display debug log message')
  .parse(process.argv);

const opts = program.opts();

const logger = winston.createLogger({
  level: opts.verbose ? 'debug' : 'info',
  format: winston.format.simple(),
  transports: new winston.transports.Console()
});

const parsedVersion = parse(opts.releaseVersion);
if (!parsedVersion) {
  logger.error(`Unable to parse the provided version : ${opts.releaseVersion as string}`);
  process.exit(10);
}


void sanitizeChangeLogs(parsedVersion);
