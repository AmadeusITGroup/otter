#!/usr/bin/env node

import { program } from 'commander';
import { Headers, Options } from 'request';
import * as request from 'request-promise-native';
import * as winston from 'winston';

program
  .description('[DEPRECATED] Clean artifacts older and not downloaded for a certain amount of time from artifactory repositories')
  .requiredOption('-u, --artifactory-url <artifactoryUrl>', 'Artifactory URL')
  .option<number>('-d, --duration-kept <numberOfDays>', 'Only artifacts which are older and have not been downloaded during this duration (in days) will be deleted.', (v) => +v, 7)
  .option<number>('-o, --offset <number>', 'Minimal number of artifacts you want to keep (newest will be kept)', (v) => +v, 10)
  .option('-r, --repository <repositoryName>', 'Artifact repository to clean up.', 'dga-docker-built-adt-nce')
  .option('-p, --path <path>', 'Artifact paths to cleanup using matcher from AQL language. Be careful that the path do not include release artifacts.', '*')
  .option('-f, --filename <filename>', 'Filenames to cleanup using matcher from AQL language.', '*')
  .option('--dry-run', 'List all files that should be deleted without actually deleting them')
  .option('-a, --api-key <apiKey>', 'Artifactory API Key of the user that can be used to log in', (value, previous) => /[a-zA-Z0-9]+/.test(value) ? value : previous)
  .option('-b, --basicAuth <base64>', 'Base 64 encoding of username:password (password already encrypted from artifactory UI)', (value, previous) => /[a-zA-Z0-9]+/.test(value) ? value : previous)
  .option('-c, --only-creation-time', 'Pass to true if you don\'t want to consider the last downloaded time')
  .option<number>('-t, --last-downloaded-time-value <numberOfDays>', 'This is to be used if you which to pass a different value than durationKept for the download part', (v) => +v)
  .option('--property <property>', 'Artifactory property to filter on')
  .option('--property-value <propertyValue>', 'Value of the Artifactory property to filter on')
  .option('-v, --verbose', 'To display the executed AQL query')
  .parse(process.argv);

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

const opts = program.opts();

const logger = winston.createLogger({
  level: opts.verbose ? 'debug' : 'info',
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console(winstonOptions.console)
  ]
});

logger.warn('This script is deprecated, will be removed in Otter v12.');

if (!opts.basicAuth && !opts.apiKey) {
  logger.error('Authentication is mandatory, please specify a base 64 encoded user:password with b parameter or an ApiKey with -a parameter');
  process.exit(1);
} else if (opts.basicAuth && opts.apiKey) {
  logger.error('Only one authentication method should be used at a time. Please provide only the apiKey (-a) or the basicAuth (-b) but not both.');
  process.exit(1);
}
let authHeader: Headers;
if (opts.basicAuth) {
  authHeader = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Authorization: 'Basic ' + (opts.basicAuth as string)
  };
} else {
  authHeader = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'X-JFrog-Art-Api': (opts.apiKey as string)
  };
}

let url: string = opts.artifactoryUrl;
url += (url.endsWith('/') ? '' : '/') + 'api/search/aql';
const programOptions = opts.opts();
const ageInDays: number = programOptions.durationKept;
const repository: string = programOptions.repository;
const path: string = programOptions.path;
const filename: string = programOptions.filename;
const offset: string = programOptions.offset;
const shouldConsiderDownloadedTime = !!programOptions.onlyCreationTime;
const isDownloadedTimeValueDefined = !!programOptions.lastDownloadedTimeValue;
const downloadedTimeValue: number = programOptions.lastDownloadedTimeValue;
const property: string = programOptions.property;
const propertyValue: string = programOptions.propertyValue;
const options: Options = {
  headers: authHeader,
  uri: url,
  body: `items.find(
    {
      "$and":
        [
          {"repo": {"$eq":"${repository}"}},
          {"$and":[{"path":{"$match":"${path}"}}, {"path":{"$nmatch":"*.npm*"}}]},
          {"name":{"$match":"${filename}"}},
          ${ (!!property && !!propertyValue) ? `{"@${property}":{"$eq":"${propertyValue}"}},` : '' }
          {"created":{"$before":"${ageInDays}d"}}${ !shouldConsiderDownloadedTime ? ',' : ''}
          ${ !shouldConsiderDownloadedTime ? `{"$or":[{"stat.downloaded": {"$before":"${ isDownloadedTimeValueDefined ? downloadedTimeValue : ageInDays}d"}}, {"stat.downloads":{"$eq":null}}]}` : '' }
        ]
    }
  )
  .include("name","repo","path","created","size")
  .sort({"$desc" : ["created"]}).offset(${offset})
  .limit(10000)`
};

logger.debug(`AQL search executed : ${options.body}`);
logger.info(`Url called : ${url}`);

void (async () => {
  logger.info(`Requesting old artifacts using  ${url}`);
  let responseSearch: any;
  try {
    responseSearch = await request.post(url, options).promise();
  } catch {
    logger.error('Error while doing the call to artifactory (authentication or url might be wrong) %o', responseSearch);
    process.exit(0);
  }
  const responseSearchObj: { results: { repo: string; path: string; name: string }[] } = JSON.parse(responseSearch);
  // uris will contain the list of all artifacts that need to be deleted
  const filesToDelete = responseSearchObj.results.map((data) => (opts.artifactoryUrl as string) + repository + '/' + data.path + '/' + data.name);
  for (const uri of filesToDelete) {
    logger.info(`Deleting ${uri}...`);
    if (!opts.dryRun) {
      if (uri.length < 1000) {
        const response = await request.delete(uri, options).promise();
        logger.info(response);
      } else {
        logger.warn('Cannot delete because path is too long');
      }
    }
  }
})();

