#!/usr/bin/env node
import { program } from 'commander';
import * as winston from 'winston';
import {parse, SemVer} from 'semver';
import {
  checkoutCrtRcBranch,
  checkoutCurrentAlphaOrNextBranch,
  commitChangeLogs,
  createNextAlphaBranch,
  createNextMajorBranch,
  createRcBranch,
  createReleaseBranch,
  deleteCrtRcBranch,
  deleteCurrentAlphaOrNextBranch,
  deletePreviousReleaseBranch,
  sanitizeChangeLogs
} from '../helpers';

program
  .description('Creates next minor/major branches and delete previous ones')
  .requiredOption('--release-version <releaseVersion>', 'Version to create RC or final release for (x.y.z format)', /^([0-9]+)\.([0-9]+)\.([0-9]+)$/)
  .requiredOption('--release-action <releaseAction>', 'Action that needs to be performed by the cli : rcRelease or finalRelease', /.*/)
  .option('--renovate-path <path>', 'Will update renovate file if found ad the given path')
  .option('--delete-previous-release', 'If true, will delete previous released branch', false)
  .option('--verbose', 'Display debug log message')
  .parse(process.argv);

const opts = program.opts();

const logger = winston.createLogger({
  level: opts.verbose ? 'debug' : 'info',
  format: winston.format.simple(),
  transports: new winston.transports.Console()
});

/**
 * Performs the operations needed for the release candidate step
 *
 * @param  {object} version
 */
async function createRcRelease(version: SemVer) {
  logger.info(`Initiating release candidate process for ${version.format()}`);
  await checkoutCurrentAlphaOrNextBranch(version, logger);
  await createRcBranch(version, logger);
  await createNextAlphaBranch(version, logger, opts.renovatePath);
  if (version.minor === 0) {
    await createNextMajorBranch(version, logger, opts.renovatePath);
  }
  await deleteCurrentAlphaOrNextBranch(version, logger);
}

/**
 * Performs the operations needed for the final release step
 *
 * @param  {object} version
 */
async function createFinalRelease(version: SemVer) {
  logger.info(`Initiating final release process for ${version.format()}.`);
  await checkoutCrtRcBranch(version, logger);
  await sanitizeChangeLogs(version);
  await commitChangeLogs(version);
  await createReleaseBranch(version, logger);
  if (opts.deletePreviousRelease) {
    await deletePreviousReleaseBranch(version, logger);
  }
  await deleteCrtRcBranch(version, logger);
}

const parsedVersion = parse(opts.releaseVersion);
if (!parsedVersion) {
  logger.error(`Unable to parse the provided version : ${opts.releaseVersion as string}`);
  process.exit(10);
}

if (opts.releaseAction === 'rcRelease') {
  void createRcRelease(parsedVersion);
} else if (opts.releaseAction === 'finalRelease') {
  void createFinalRelease(parsedVersion);
} else {
  logger.error(`Invalid action '${opts.releaseAction as string}'.`);
  process.exit(9);
}
