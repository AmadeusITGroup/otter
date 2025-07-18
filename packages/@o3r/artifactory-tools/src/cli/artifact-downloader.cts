#!/usr/bin/env node

import {
  existsSync,
  mkdirSync,
  writeFileSync,
} from 'node:fs';
import {
  basename,
  join,
  resolve,
} from 'node:path';
import type {
  CliWrapper,
} from '@o3r/telemetry';
import {
  program,
} from 'commander';
import * as winston from 'winston';

program
  .description('Download artifacts from artifactory repositories')
  .requiredOption('-u, --url <url>', 'Full URL of the artifact to download')
  .option('-o, --output-dir <outputDir>', 'Output directory for the downloaded file', '.')
  .option('-f, --filename <filename>', 'Output filename (if not provided, will use the filename from URL)')
  .option('--artifactory-user <user>', 'Artifactory username (can also be set via ARTIFACTORY_USER env var)')
  .option('--artifactory-password <password>', 'Artifactory password (can also be set via ARTIFACTORY_PASSWORD env var)')
  .option('-b, --basic-auth <base64>', 'Base64 encoding of username:password (takes priority over --artifactory-user/--artifactory-password)')
  .option('-v, --verbose', 'Display verbose output')
  .parse(process.argv);

const programOptions = program.opts();

const logger = winston.createLogger({
  level: programOptions.verbose ? 'debug' : 'info',
  format: winston.format.simple(),
  transports: new winston.transports.Console()
});

const artifactoryUser = programOptions.artifactoryUser || process.env.ARTIFACTORY_USER;
const artifactoryPassword = programOptions.artifactoryPassword || process.env.ARTIFACTORY_PASSWORD;
const basicAuth = programOptions.basicAuth;

const url: string = programOptions.url;
const outputDir: string = resolve(process.cwd(), programOptions.outputDir);
const filename: string = programOptions.filename || basename(new URL(url).pathname);
const outputPath = join(outputDir, filename);

const getAuthHeaders = (): Record<string, string> => {
  if (basicAuth) {
    return { Authorization: `Basic ${basicAuth}` };
  } else if (artifactoryPassword) {
    const auth = Buffer.from(`${artifactoryUser || ''}:${artifactoryPassword}`).toString('base64');
    return { Authorization: `Basic ${auth}` };
  }
  return {};
};

const run = async (): Promise<void> => {
  logger.info(`Downloading artifact from: ${url}`);
  logger.info(`Output file: ${outputPath}`);

  if (!existsSync(outputDir)) {
    logger.info(`Creating output directory: ${outputDir}`);
    mkdirSync(outputDir, { recursive: true });
  }

  try {
    const authHeaders = getAuthHeaders();
    const options = {
      method: 'GET',
      headers: authHeaders
    } as const satisfies RequestInit;

    const response = await fetch(url, options);

    if (response.status === 401 && Object.keys(authHeaders).length === 0) {
      logger.error('Authentication required but no credentials provided. Please provide one of the following:');
      logger.error('  1. --artifactory-user and --artifactory-password (or set ARTIFACTORY_USER and ARTIFACTORY_PASSWORD env vars)');
      logger.error('  2. --basic-auth for base64 encoded username:password');
      throw new Error('Authentication required but no credentials provided');
    }

    if (!response.ok) {
      logger.error(`Failed to download file: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    writeFileSync(outputPath, new Uint8Array(buffer));

    logger.info(`Successfully downloaded artifact to ${outputPath}`);
  } catch (err) {
    logger.error(`Download error: ${(err as Error).message}`);
    throw err;
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
  return wrapper(run, '@o3r/artifactory-tools:artifact-downloader', { logger, preParsedOptions: programOptions })();
})();
