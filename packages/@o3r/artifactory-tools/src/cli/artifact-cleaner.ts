#!/usr/bin/env node



import { program } from 'commander';
import {Headers} from 'request';
import * as winston from 'winston';

program
  .description('Clean old artifacts from artifactory repositories')
  .requiredOption('--artifactory-url <artifactoryUrl>', 'Artifactory URL')
  .requiredOption('-b, --basicAuth <basicAuth>', 'Base64 encoding of username:password (password already encrypted from artifactory UI)')
  .requiredOption(
    '-r, --repositories <repositories>',
    'Artifact repositories to clean up (comma separated) ex: \'repo1,repo2\'',
    (repos: string) => repos.split(',')
  )
  .option('-d, --duration-kept <durationKept>', 'All artifacts older than this value (in ms) will be deleted. (Default: 604800000 ms, i.e., 7 days)', (v) => +v, 604800000)
  .option(
    '-t, --type-filter <typeFilter>',
    'List of artifact types that should be deleted (comma separated) ex: \'jar,tgz\' (Default: [\'tgz\',\'json\'])',
    (type: string) => type.split(','),
    ['tgz','json']
  )
  .option('--dry-run <dryRun>', 'List all files that would be deleted without actually deleting them', false)
  .parse(process.argv);

const opts = program.opts();

const logger = winston.createLogger({
  level: opts.verbose ? 'debug' : 'info',
  format: winston.format.simple(),
  transports: new winston.transports.Console()
});

/**
 * Returns true if the url match one of the artifact types
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
  let responseSearch;
  let responseSearchObj: { results: { uri: string }[] };
  try {
    responseSearch = await fetch(url, options);
    responseSearchObj = await responseSearch.json();
  } catch (e) {
    logger.warn('No result found ', e);
    process.exit(0);
  }
  /** uris will contain the list of all artifacts that need to be deleted */
  const uris = responseSearchObj.results
    .map((res) => res.uri)
    .filter((uri) => matchFilter(uri, opts.typeFilter))
    .map((uri) => uri.replace('/api/storage', ''));
  for (const uri of uris) {
    logger.info(`Deleting ${uri}...`);
    if (!opts.dryRun) {
      const response = await fetch(uri, {...options, method: 'DELETE'});
      logger.info(response);
    }
  }
})();
