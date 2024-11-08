#!/usr/bin/env node

import type {
  CliWrapper,
} from '@o3r/telemetry';
import {
  program,
} from 'commander';
import * as winston from 'winston';

program
  .description('Clean pr artifacts from artifactory repositories')
  .requiredOption('-u, --artifactory-url <artifactoryUrl>', 'Artifactory URL')
  .requiredOption('-r, --repository <repositoryName>', 'Artifact repository to clean up.')
  .requiredOption('-p, --path <path>', 'Artifact paths to clean up (using matcher from AQL language). Be careful not to include release artifacts in the path.')
  .option<number>('-d, --duration-kept <numberOfDays>', 'All artifacts older than this value (in days) will be deleted.', (v) => +v, 1)
  .option<number>('-n, --pr-builds <prBuilds>', 'Number of PR build artifacts that will be kept.', (v) => +v, 1)
  .option('--dry-run', 'List all files that would be deleted without actually deleting them', false)
  .option('-a, --api-key <apiKey>', 'Artifactory API Key of the user that can be used to log in')
  .option('-b, --basicAuth <base64>', 'Base64 encoding of username:password (password already encrypted from artifactory UI)')
  .option('-v, --verbose', 'Display the executed AQL query')
  .parse(process.argv);

const programOptions = program.opts();
const winstonOptions = {
  console: {
    format: winston.format.combine(
      winston.format.prettyPrint(),
      winston.format.splat(),
      winston.format.printf((info) => {
        if (typeof info.message === 'object') {
          info.message = JSON.stringify(info.message, null, 3);
        }

        return info.message;
      })
    )
  }
};

const logger = winston.createLogger({
  level: programOptions.verbose ? 'debug' : 'info',
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console(winstonOptions.console)
  ]
});

if (!programOptions.basicAuth && !programOptions.apiKey) {
  logger.error('Authentication is mandatory, please specify a base64 encoded user:password with the -b parameter or an ApiKey with the -a parameter');
  process.exit(1);
}
if (programOptions.basicAuth && programOptions.apiKey) {
  logger.error('Only one authentication method should be used at a time. Please provide only the apiKey (-a) or the basicAuth (-b) but not both.');
  process.exit(1);
}
const authHeader: RequestInit['headers'] = programOptions.basicAuth
  ? { Authorization: `Basic ${programOptions.basicAuth as string}` }
  : { 'X-JFrog-Art-Api': programOptions.apiKey as string };
let url: string = programOptions.artifactoryUrl;
url += (url.endsWith('/') ? '' : '/') + 'api/search/aql';
const ageInDays: number = programOptions.durationKept;
const prBuilds: number = programOptions.prBuilds;
const repository: string = programOptions.repository;
const path: string = programOptions.path;
const fetchOptions = {
  method: 'POST',
  headers: authHeader,
  body: `items.find(
        {
          "$and":
            [
              {"repo": {"$eq":"${repository}"}},
              {"path":{"$match":"${path}"}},
              {"created":{"$before":"${ageInDays}d"}}
            ]
        }
      ).include("name","repo","path","created")
      .sort({"$desc" : ["path","name"]})
      .limit(10000)`
} as const satisfies RequestInit;

logger.debug(`AQL search executed : ${fetchOptions.body}`);
logger.info(`Url called : ${url}`);

const run = async () => {
  logger.info(`Requesting old artifacts using  ${url}`);
  let responseSearch: any;
  let responseSearchObj: { results: { repo: string; path: string; name: string }[] };
  try {
    responseSearch = await fetch(url, fetchOptions);
    responseSearchObj = await responseSearch.json();
  } catch (e) {
    logger.warn('No result found %o', e);
    process.exit(0);
  }
  /** uris will contain the list of all artifacts that need to be deleted */
  const mapOfKeptItems = new Map<string, number[]>();
  const mapOfKeptResult = new Map<string, { repo: string; path: string; name: string }[]>();
  const resultToDelete: { repo: string; path: string; name: string }[] = [];
  const sortedResult = responseSearchObj.results.sort((a, b) => b.name.localeCompare(a.name));
  for (const result of sortedResult) {
    const splitPath = result.name.split('.');
    const mapId = splitPath.slice(0, -2).join('.');
    const currentBuildNumber = +splitPath.at(-2)!;
    const buildNumbers = mapOfKeptItems.get(mapId);
    if (buildNumbers) {
      buildNumbers.sort();
      let isBuildNumberAlreadyInMap = false;
      let isBuildNumberHigherThanExisting = true;
      buildNumbers.forEach((value) => {
        isBuildNumberAlreadyInMap = isBuildNumberAlreadyInMap || (value === currentBuildNumber);
        isBuildNumberHigherThanExisting = isBuildNumberHigherThanExisting && (value < currentBuildNumber);
      });
      if (!isBuildNumberAlreadyInMap) {
        if (buildNumbers.length >= prBuilds && !isBuildNumberHigherThanExisting) {
          resultToDelete.push(result);
        } else {
          if (buildNumbers.length >= prBuilds && isBuildNumberHigherThanExisting) {
            const buildNumberToRemove = buildNumbers.shift();
            if (buildNumberToRemove) {
              const resultsToRemove = mapOfKeptResult.get(`${mapId}${buildNumberToRemove}`);
              if (resultsToRemove) {
                resultToDelete.push(...resultsToRemove);
              }
            }
          }
          buildNumbers.push(currentBuildNumber);
          buildNumbers.sort();
          mapOfKeptItems.set(mapId, buildNumbers);
          const keptBuildNumbers = mapOfKeptResult.get(`${mapId}${currentBuildNumber}`);
          if (keptBuildNumbers) {
            keptBuildNumbers.push(result);
            mapOfKeptResult.set(`${mapId}${currentBuildNumber}`, keptBuildNumbers);
          } else {
            mapOfKeptResult.set(`${mapId}${currentBuildNumber}`, [result]);
          }
        }
      }
    } else {
      mapOfKeptItems.set(mapId, [currentBuildNumber]);
    }
  }
  logger.debug('Map of build that will be kept: %o', mapOfKeptItems);

  const filesToDelete = resultToDelete.map(
    (data) => (programOptions.artifactoryUrl as string) + (programOptions.artifactoryUrl.endsWith('/') ? '' : '/') + repository + '/' + data.path + '/' + data.name
  );
  for (const uri of filesToDelete) {
    logger.info(`Deleting ${uri}...`);
    if (!programOptions.dryRun) {
      const response = await fetch(uri, { method: 'DELETE', headers: authHeader });
      logger.info(response);
    }
  }
};

void (async () => {
  let wrapper: CliWrapper = (fn: any) => fn;
  try {
    const { createCliWithMetrics } = await import('@o3r/telemetry');
    wrapper = createCliWithMetrics;
  } catch {
    // Do not throw if `@o3r/telemetry` is not installed
  }
  return wrapper(run, '@o3r/artifactory-tools:pr-artifact-cleaner', { logger, preParsedOptions: programOptions })();
})();
