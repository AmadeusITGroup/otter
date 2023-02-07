#!/usr/bin/env node



import { program } from 'commander';
import {Headers} from 'request';
import * as request from 'request-promise-native';
import * as winston from 'winston';

program
  .description('Clean old artifacts from artifactory repositories')
  .option('--artifactory-url <artifactoryUrl>', 'Artifactory URL', 'https://digitalforairlines.jfrog.io/digitalforairlines/')
  .option('-d, --duration-kept <durationKept>', 'All artifacts which have not been downloaded and are older than this value(ms) will be deleted. Default to 10080000ms (7 days)', '604800000')
  .option(
    '-r, --repositories <repositories>',
    'Artifact repositories to clean up (coma separated) ex : npm-otter-pr,npm-refx-pr (Default to npm-otter-pr)',
    (repos: string) => repos.split(','),
    ['npm-otter-pr']
  )
  .option('-t, --type-filter <typeFilter>', 'List of artifact type that should be deleted coma separated (ex: jar,tgz) (Default : tgz)', (type: string) => type.split(','), ['tgz,json'])
  .option('--dry-run <dryRun>', 'List all files that should be deleted without actually deleting them', false)
  .option('-b, --basicAuth <basicAuth>', 'Base 64 encoding of username:password (password already encrypted from artifactory UI)')
  .parse(process.argv);

const opts = program.opts();

const logger = winston.createLogger({
  level: opts.verbose ? 'debug' : 'info',
  format: winston.format.simple(),
  transports: new winston.transports.Console()
});

/**
 * Returns true if the url match one of the artifact types
 *
 * @param fullUrl
 * @param types
 */
const matchFilter = (fullUrl: string, types: string[]) => {
  for (const type of types) {
    if (fullUrl.endsWith(type)) {
      return true;
    }
  }
  logger.info(`${fullUrl} dropped because it doesn't match any of the patterns`);
  return false;
};

if (!opts.basicAuth) {
  logger.error('Authentication is mandatory, please specify a base 64 encoded user:password');
  process.exit(1);
}
let url = opts.artifactoryUrl as string;
const options: { headers: Headers } = {
  headers: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Authorization: 'Basic ' + (opts.basicAuth as string)
  }
};
const limitTimestampToKeepOldArtifact = Date.now() - opts.durationKept;
url += (url.endsWith('/') ? '' : '/') +
  `api/search/usage?notUsedSince=${limitTimestampToKeepOldArtifact}&createdBefore=${limitTimestampToKeepOldArtifact}&repos=${(opts.repositories as string[]).join(',')}`;

logger.info(`Url called : ${url}`);

void (async () => {
  logger.info(`Requesting old artifacts using  ${url}`);
  const responseSearch = await request.get(url, options).promise().catch((e) => {
    logger.warn('No result found ', e);
    process.exit(0);
  });
  const responseSearchObj: { results: { uri: string }[] } = JSON.parse(responseSearch);
  /** uris will contain the list of all artifacts that need to be deleted */
  const uris = responseSearchObj.results
    .map((res) => res.uri)
    .filter((uri) => matchFilter(uri, opts.typeFilter))
    .map((uri) => uri.replace('/api/storage', ''));
  for (const uri of uris) {
    logger.info(`Deleting ${uri}...`);
    if (!opts.dryRun) {
      const response = await request.delete(uri, options).promise();
      logger.info(response);
    }
  }
})();
