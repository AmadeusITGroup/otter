#!/usr/bin/env node

import { program } from 'commander';
import { Headers, Options } from 'request';
import * as request from 'request-promise-native';
import * as winston from 'winston';

program
  .description('Clean pr artifacts from artifactory repositories')
  .requiredOption('-u, --artifactory-url <artifactoryUrl>', 'Artifactory URL')
  .option<number>('-d, --duration-kept <numberOfDays>', 'Only artifacts which are older and have not been downloaded during this duration (in days) will be deleted.', (v) => +v, 1)
  .option<number>('-pr, --pr-versions <prVersions>', 'Number of pr versions that will be kept.', (v) => +v, 1)
  .option('-r, --repository <repositoryName>', 'Artifact repository to clean up.', 'dga-maven-built-adt-nce')
  .option('-p, --path <path>', 'Artifact paths to cleanup use matcher from AQL language. Be careful that the path do not include release artifacts.', 'com/amadeus/retailing/*-PR-*')
  .option('--dry-run', 'List all files that should be deleted without actually deleting them')
  .option('-a, --api-key <apiKey>', 'Artifactory API Key of the user that can be used to log in')
  .option('-b, --basicAuth <base64>', 'Base 64 encoding of username:password (password already encrypted from artifactory UI)')
  .option('-v, --verbose', 'To display the executed AQL query')
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
  logger.error('Authentication is mandatory, please specify a base 64 encoded user:password with b parameter or an ApiKey with -a parameter');
  process.exit(1);
}
if (programOptions.basicAuth && programOptions.apiKey) {
  logger.error('Only one authentication method should be used at a time. Please provide only the apiKey (-a) or the basicAuth (-b) but not both.');
  process.exit(1);
}
// eslint-disable-next-line @typescript-eslint/naming-convention
const authHeader: Headers = programOptions.basicAuth ? { Authorization: `Basic ${programOptions.basicAuth as string}`} : {'X-JFrog-Art-Api': programOptions.apiKey as string};
let url: string = programOptions.artifactoryUrl;
url += (url.endsWith('/') ? '' : '/') + 'api/search/aql';
const ageInDays: number = programOptions.durationKept;
const prVersions: number = programOptions.prVersions;
const repository: string = programOptions.repository;
const path: string = programOptions.path;
const options: Options = {
  headers: authHeader,
  uri: url,
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
};
// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
logger.debug(`AQL search executed : ${options.body}`);
logger.info(`Url called : ${url}`);

/**
 * @param result
 * @param result.repo
 * @param result.path
 * @param result.name
 * @param pathWithoutBuildNumber
 */
function getUniqueId(result: { repo: string; path: string; name: string }, pathWithoutBuildNumber: string) {
  let mapId: string;
  if (result.path.indexOf('.') !== -1 && result.path.indexOf('-') !== -1) {
    const splittedPath = result.path.split('/');
    const partialPathWithBuildNumber = splittedPath.find((currentPath) => currentPath.indexOf('.') !== -1);
    if (partialPathWithBuildNumber) {
      const splittedPartialPathWithDot = partialPathWithBuildNumber.split('.');
      splittedPartialPathWithDot.splice(splittedPartialPathWithDot.length - 1, 1);
      mapId = splittedPartialPathWithDot.join('.');
    } else {
      const splittedName = result.name.split('.');
      const splittedNameDash = splittedName[splittedName.length - 2].split('-');
      splittedNameDash.splice(0, 1);
      splittedName[splittedName.length - 2] = splittedNameDash.join('-');
      const nameWithoutBuildNumber = splittedName.join('.');
      mapId = pathWithoutBuildNumber + '/' + nameWithoutBuildNumber;
    }
  } else {
    mapId = pathWithoutBuildNumber + result.name;
  }
  return mapId;
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  logger.info(`Requesting old artifacts using  ${url}`);
  let responseSearch: any;
  try {
    responseSearch = await request.post(url, options).promise();
  } catch {
    logger.warn('No result found %o', responseSearch);
    process.exit(0);
  }
  const responseSearchObj: { results: { repo: string; path: string; name: string }[] } = JSON.parse(responseSearch);
  /** uris will contain the list of all artifacts that need to be deleted */
  const mapOfKeptItems = new Map<string, number[]>();
  const mapOfKeptResult = new Map<string, { repo: string; path: string; name: string }[]>();
  const resultToDelete: { repo: string; path: string; name: string }[] = [];
  const sortedResult = responseSearchObj.results.sort((a, b) => b.name.localeCompare(a.name));
  for (const result of sortedResult) {
    const splittedPathBySlash = result.path.split('/');
    const folderwithBuildNumber = splittedPathBySlash.filter((value) => value.indexOf('.') !== -1)[0];
    const splittedPath = folderwithBuildNumber.split('.');
    const pathWithoutBuildNumber = splittedPath.slice(0, -1).join('.');
    const currentBuildNumber = +splittedPath[splittedPath.length - 1];
    const mapId: string = getUniqueId(result, pathWithoutBuildNumber);
    const buildNumbers = mapOfKeptItems.get(mapId);
    if (!buildNumbers) {
      mapOfKeptItems.set(mapId, [currentBuildNumber]);
    } else {
      buildNumbers.sort();
      let isBuildNumberAlreadyInMap = false;
      let isBuildNumberHigherThanExisting = true;
      buildNumbers.forEach((value) => {
        isBuildNumberAlreadyInMap = isBuildNumberAlreadyInMap || (value === currentBuildNumber);
        isBuildNumberHigherThanExisting = isBuildNumberHigherThanExisting && (value < currentBuildNumber);
      });
      if (!isBuildNumberAlreadyInMap) {
        if (buildNumbers.length >= prVersions && !isBuildNumberHigherThanExisting) {
          resultToDelete.push(result);
        } else {
          if (buildNumbers.length >= prVersions && isBuildNumberHigherThanExisting) {
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
          if (!keptBuildNumbers) {
            mapOfKeptResult.set(`${mapId}${currentBuildNumber}`, [result]);
          } else {
            keptBuildNumbers.push(result);
            mapOfKeptResult.set(`${mapId}${currentBuildNumber}`, keptBuildNumbers);
          }
        }
      }
    }
  }
  logger.debug('Map of build that will be kept: %o', mapOfKeptItems);

  const filesToDelete = resultToDelete.map((data) => (programOptions.artifactoryUrl as string) + repository + '/' + data.path + '/' + data.name);
  for (const uri of filesToDelete) {
    logger.info(`Deleting ${uri}...`);
    if (!programOptions.dryRun) {
      const response = await request.delete(uri, options).promise();
      logger.info(response);
    }
  }
})();

