#!/usr/bin/env node
import { program } from 'commander';
import * as fse from 'fs-extra';
import * as http from 'node:http';
import * as https from 'node:https';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { CookieJar, Headers } from 'request';
import * as request from 'request-promise-native';
import * as winston from 'winston';
import { GavcResponse } from '../helpers/gavc-response';

const SUPPORTED_REPOSITORY_MANAGERS = ['JFrog', 'Azure Artifacts'];

program
  .description('[DEPRECATED] Get an artifact from an Artifact repository manager')
  .requiredOption('--registry <url>', 'Registry URL. It is ignored for Azure Artifacts.')
  .option('--repository-manager <manager>', `Artifact repository manager. Supported managers are ${SUPPORTED_REPOSITORY_MANAGERS.join(', ')}`, 'JFrog')
  .option('--organization <organization>', 'Azure Artifacts organization', undefined)
  .option('--project <project>', 'Azure Artifacts project', undefined)
  .option('--feed <feed>', 'Azure Artifacts feed', undefined)
  .option('-a, --artifact-name <name>', 'Artifact name', undefined)
  .option('-v, --artifact-version <version>', 'Artifact version', undefined)
  .option('-g, --artifact-group-id <group>', 'Artifact group id', undefined)
  .option('-r, --artifact-repos <repositories>', 'Artifact repositories', (repos: string) => repos.split(','), [])
  .option('-u, --username <username>', 'Artifactory username', 'mvn-readonly')
  .option('-p, --password <password>', 'Artifactory user password')
  .option('--password_env_var <password_env_var>', 'Artifactory user password environment var', undefined)
  .option('-o, --out <path>', 'Output file name (default: ./built/${name}.jar)', undefined)
  .option('--silent', 'Prevent exit code 1 if artifact not found (Usage example : dep-checker with post-install scripts', false)
  .option('--verbose', 'Display debug log message')
  .option('--use-package-version', 'Use the package version as artifact version')
  .parse(process.argv);

const opts = program.opts();

const logger = winston.createLogger({
  level: opts.verbose ? 'debug' : 'info',
  format: winston.format.simple(),
  transports: new winston.transports.Console()
});

logger.warn('This script is deprecated, will be removed in Otter v12.');

if (!SUPPORTED_REPOSITORY_MANAGERS.includes(opts.repositoryManager)) {
  logger.error(`Unsupported repository manager: ${opts.repositoryManager as string}`);
  process.exit(10);
}

if (opts.repositoryManager === 'Azure Artifacts') {
  if (!opts.organization) {
    logger.error('No organization specified for Azure Artifacts');
    process.exit(11);
  }
  if (!opts.project) {
    logger.error('No project specified for Azure Artifacts');
    process.exit(12);
  }
  if (!opts.feed) {
    logger.error('No feed specified for Azure Artifacts');
    process.exit(13);
  }
}

if (!opts.artifactVersion && !opts.usePackageVersion) {
  logger.error('No version specified');
  process.exit(14);
}

if (!opts.artifactName) {
  logger.error('No artifact name specified');
  process.exit(15);
}

if (!opts.artifactGroupId) {
  logger.error('No group id specified');
  process.exit(16);
}

let url: string = opts.registry;
const jar = request.jar();
const options: {headers?: Headers; jar: CookieJar} = {jar};
const password = opts.password || opts.password_env_var && process.env[opts.password_env_var];
if (opts.username && password) {
  options.headers = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Authorization: 'Basic ' + Buffer.from(`${opts.username as string}:${password as string}`).toString('base64')
  };
}
const name: string = opts.artifactName;
const artifactGroupId: string = opts.artifactGroupId;

let version: string = opts.usePackageVersion ? JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), { encoding: 'utf8' })).version : opts.artifactVersion;

const filePath = opts.out || `./built/${name}.jar`;
fse.ensureDirSync(path.resolve(process.cwd(), path.dirname(filePath)));

/**
 * Report error on artifact downloading
 * @param e
 */
const reportError = (e: Error) => {
  logger.error(e);
};


/**
 * Download the specified Artifact on JFrog
 */
async function retrieveArtifactFromJFrog() {
  logger.info(`Searching for ${name}@${version}`);

  url += (url.endsWith('/') ? '' : '/') + `api/search/gavc?a=${name}&g=${artifactGroupId}`;

  if (opts.artifactRepos && opts.artifactRepos.length) {
    url += `&repos=${(opts.artifactRepos as string[]).join(',')}`;
  }

  if (version.startsWith('0.0.0')) {
    url += `&v=${version}`;
  }
  let responseSearch;
  try {
    responseSearch = await request.get(url, options).promise();
  } catch (err) {
    logger.warn('First call to get artifact information failed, retries');
    responseSearch = await request.get(url, options).promise();
  }
  // eslint-disable-next-line no-console
  console.log(responseSearch);
  const responseSearchObj: {results: {uri: string}[]} = JSON.parse(responseSearch);
  const uris = responseSearchObj.results
    .map((res) => res.uri)
    .filter((uri) => uri.endsWith('.jar'))
    .sort((a, b) => {
      if (a > b) {
        return -1;
      } else if (a < b) {
        return 1;
      }
      return 0;
    });

  if (uris.length) {
    const artifactUrl = uris[0];
    logger.info(`Call to ${artifactUrl}`);
    const gavcResponse: string = await request.get(artifactUrl, options).promise();
    logger.debug(`GavcResponse : ${gavcResponse}`);
    const parsedGavcResponse: GavcResponse = JSON.parse(gavcResponse);
    const downloadUri: string = parsedGavcResponse.downloadUri;
    logger.info(`Downloading artifact ${downloadUri}`);

    const file = fs.createWriteStream(path.resolve(process.cwd(), filePath));
    file.on('error', reportError);

    const cookieString = jar.getCookieString(url);
    const httpOptions = {headers: options.headers ? {...options.headers, cookie: cookieString} : undefined};

    if (artifactUrl.startsWith('https')) {
      https.get(downloadUri, httpOptions, (response) => response.pipe(file)).on('error', reportError);
    } else {
      http.get(downloadUri, httpOptions, (response) => response.pipe(file)).on('error', reportError);
    }
  } else {
    if (opts.silent) {
      logger.warn('No artifact found, silent mode ON, prevented the failure');
    } else {
      logger.error('No artifact found');
      process.exit(2);
    }
  }
}

/**
 * Get the latest version, if it exists, of the specified artifact
 * @param packages Array of packages from the Azure feed
 * @param artifactName Name of the artifact to get the latest version from
 */
function getLatestVersion(packages: Record<string, any>[], artifactName: string) {
  const normalizedArtifactName = `${artifactGroupId}:${artifactName}`.toLowerCase();
  for (const pckg of packages) {
    if (pckg.normalizedName === artifactName || pckg.normalizedName === normalizedArtifactName) {
      const latestVersion = (pckg.versions as {isLatest: boolean; version: string}[]).find(v => v.isLatest);
      if (!latestVersion) {
        throw new Error(`No latest version found for ${artifactName}`);
      }
      return latestVersion.version;
    }
  }
  throw new Error(`No package ${artifactName} found`);
}

/**
 * Download the specified Artifact on Azure
 */
async function retrieveArtifactFromAzure() {
  try {
    if (version.startsWith('0.0.0')) {
      // eslint-disable-next-line @stylistic/js/max-len
      const res = await request.get(`https://feeds.dev.azure.com/${opts.organization as string}/${opts.project as string}/_apis/packaging/feeds/${opts.feed as string}/packages?api-version=6.0-preview.1`, options).promise();
      version = getLatestVersion(JSON.parse(res).value, name);
    }
    logger.info(`Searching for ${name}@${version}`);

    // eslint-disable-next-line @stylistic/js/max-len
    url = `https://pkgs.dev.azure.com/${opts.organization as string}/${opts.project as string}/_apis/packaging/feeds/${opts.feed as string}/maven/${opts.artifactGroupId as string}/${name}/${version}/${name}-${version}.jar/content?api-version=6.0-preview.1`;

    logger.info(`Call to ${url}`);
    const downloadUri = await new Promise<string | undefined>((resolve, reject) => {
      https.get(url, options, (response) => resolve(response.headers.location)).on('error', reject);
    });
    if (!downloadUri) {
      throw new Error(`Could not get the download url for the artifact ${name}`);
    }
    logger.info(`Downloading artifact ${downloadUri}`);

    const file = fs.createWriteStream(path.resolve(process.cwd(), filePath));
    file.on('error', reportError);

    if (!downloadUri.startsWith('https')) {
      throw new Error('Artifact must be downloaded using https protocol');
    }
    https.get(downloadUri, (response) => response.pipe(file)).on('error', reportError);
  } catch (e) {
    if (opts.silent) {
      logger.warn(e);
    } else {
      logger.error(e);
      process.exit(3);
    }
  }
}
/**
 * Download an artifact on the specified artifact repository manager
 * @param registry Registry url
 */
function retrieveArtifact() {
  switch (opts.repositoryManager) {
    case 'JFrog': {
      return retrieveArtifactFromJFrog();
    }
    case 'Azure Artifacts': {
      return retrieveArtifactFromAzure();
    }
  }
}
void retrieveArtifact();
