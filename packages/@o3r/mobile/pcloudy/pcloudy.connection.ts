#!/usr/bin/env node

import { program } from 'commander';
import {PCloudyApi} from './pcloudy.api';
import {PCloudyService} from './pcloudy.service';
import * as winston from 'winston';
import {Logger} from 'winston';

/**
 * Create a command line logger
 *
 * @param verbose Show debug information
 * @param pretty Colorize and format logs as json
 */
function getLogger(verbose: boolean, pretty: boolean) {
  return winston.createLogger({
    level: verbose ? 'debug' : 'info',
    format: pretty ? winston.format.prettyPrint({colorize: true}) : winston.format.simple(),
    transports: new winston.transports.Console()
  });
}

/**
 * Command to upload an app on pCloudy
 * In case the file is an .ipa, the application will be resigned
 *
 * @param username pCloudy email credential
 * @param apiKey Account APIKey - can be found on pCloudy account info
 * @param application .ipa or .apk file to upload on pCloudy
 * @param override Replace the file on pCloudy if it already exists if true - else skip the process
 * @param logger
 * @returns name of signed app that can be installed on your device
 */
async function uploadApp(username: string, apiKey: string, application: string, override: boolean, logger: Logger) {
  try {
    const pCloudService = new PCloudyService(new PCloudyApi(logger, username, apiKey), logger);
    // Upload of application
    return await pCloudService.uploadApp(application, override);
  } catch (err) {
    logger.error('Error', err);
    process.exit(0);
  }
}

/**
 * Command to delete an app uploaded on pCloudy
 *
 * @param username pCloudy email credential
 * @param apiKey Account APIKey - can be found on pCloudy account info
 * @param application name as uploaded on the cloud
 * @param logger
 */
async function deleteApp(username: string, apiKey: string, application: string, logger: Logger) {
  try {
    const pCloudService = new PCloudyService(new PCloudyApi(logger, username, apiKey), logger);
    return await pCloudService.deleteApp(application);
  } catch (err) {
    logger.error('Error', err);
    process.exit(0);
  }
}

/**
 * List the devices available for booking on pCloudy
 *
 * @param username pCloudy email credential
 * @param apiKey Account APIKey - can be found on pCloudy account info
 * @param devicePlatform Filter the devices according to their platform
 * @param minVer OS minimum version for the devices
 * @param logger
 */
async function getAvailableDevices(username: string, apiKey: string, devicePlatform: 'android' | 'ios', minVer: number, logger: Logger) {
  try {
    const pCloudService = new PCloudyService(new PCloudyApi(logger, username, apiKey), logger);
    return await pCloudService.getMatchingDevices(devicePlatform, minVer);
  } catch (err) {
    logger.error(err);
    process.exit(0);
  }
}

program
  .command('upload-app')
  .description('Upload your application on pcloudy')
  .requiredOption('-u, --username <username>', 'Authentication user name', /.*/)
  .requiredOption('-p, --password <password>', 'Authentication password', /.*/)
  .requiredOption('-a, --application <application>', 'Application to install', /.*/)
  .option('-o, --no-override', 'If application is already uploaded, do not replace it')
  .option('--verbose', 'Print debug logs ')
  .option('--pretty', 'Prettify logs ')
  .action(async (options) => {
    const logger = getLogger(options.verbose, options.pretty);
    /* eslint-disable-next-line no-console */
    console.log(await uploadApp(options.username, options.password, options.application, options.override, logger));
  });

program
  .command('delete-app')
  .description('Delete your application from pcloudy')
  .requiredOption('-u, --username <username>', 'Authentication user name', /.*/)
  .requiredOption('-p, --password <password>', 'Authentication password', /.*/)
  .requiredOption('-a, --application <application>', 'Application name on pCloudy', /.*/)
  .option('--verbose', 'Print debug logs ')
  .option('--pretty', 'Prettify logs ')
  .action(async (options) => {
    const logger = getLogger(options.verbose, options.pretty);
    /* eslint-disable-next-line no-console */
    await deleteApp(options.username, options.password, options.application, logger);
  });

program
  .command('get-available-devices')
  .description('Get the list of available devices')
  .requiredOption('-u, --username <username>', 'Authentication user name', /.*/)
  .requiredOption('-p, --password <password>', 'Authentication password', /.*/)
  .requiredOption('-d, --devicePlatform <devicePlatform>', 'Platform of your devices: android or ios', /.*/)
  .option('-m, --minVersion <minVersion>', 'OS minimum version', /.*/)
  .option('--verbose', 'Print debug logs ')
  .option('--pretty', 'Prettify logs ')
  .action(async (options) => {
    const logger = getLogger(options.verbose, options.pretty);
    /* eslint-disable-next-line no-console */
    console.log(await getAvailableDevices(options.username, options.password, options.devicePlatform, options.minVersion, logger));
  });

program.parse(process.argv);
