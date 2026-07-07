#!/usr/bin/env node

import * as fs from 'node:fs';
import * as path from 'node:path';
import type {
  CliWrapper,
} from '@o3r/telemetry';
import {
  program,
} from 'commander';
import {
  sync as globbySync,
} from 'globby';
import {
  clean,
} from 'semver';
import * as winston from 'winston';
import {
  createPlaceholderRegex,
  privateFieldRegex,
  wildcardVersionRegex,
  workspaceProtocolRegex,
} from './set-version-regexes';

const defaultIncludedFiles = ['**/package.json', '**/lerna.json', '!**/templates', '!**/node_modules'];

const collect = (pattern: string, patterns: string[]) => {
  if (patterns === defaultIncludedFiles && pattern) {
    patterns = [];
  }
  patterns.push(pattern);
  return patterns;
};

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: new winston.transports.Console()
});

let replaceVersion: string;
program
  .arguments('<version>')
  .description('Replace the packages version in a monorepos')
  .option('-p, --placeholder <placeholder>', 'Pattern of the version placeholder', '0.0.0(-placeholder)?')
  .option('--include <file>', 'Add files pattern to apply the version replacement', collect, defaultIncludedFiles)
  .option('--set-public', 'Enforce the package to be public', process.env.O3R_SET_PUBLIC === 'true')
  .option('-v, --verbose', 'Display debug logs')
  .action((version: string) => {
    const cleanVersion = clean(version);
    if (!cleanVersion) {
      // eslint-disable-next-line no-console -- no other logger available
      console.error(`The version "${version}" is invalid`);
      return process.exit(1);
    }
    replaceVersion = cleanVersion;
  })
  .parse(process.argv);

const options: any = program.opts();
logger.level = options.verbose ? 'debug' : 'info';

const cliFn = () => {
  globbySync(options.include, { cwd: process.cwd() })
    .map((file: string) => path.join(process.cwd(), file))
    .map((filePath: string) => ({
      path: filePath,
      content: fs.readFileSync(filePath).toString()
    }))
    .forEach((pathWithContent: { path: string; content: string }) => {
      const placeholderRegex = createPlaceholderRegex(options.placeholder as string);
      let newContent = pathWithContent.content
        .replace(placeholderRegex, `"$1${replaceVersion}"`)
        .replace(workspaceProtocolRegex, `"$1${replaceVersion}"$2`)
        .replace(wildcardVersionRegex, `"=$1"$2`);
      if (options.setPublic) {
        newContent = newContent.replace(privateFieldRegex, '');
      }
      if (newContent === pathWithContent.content) {
        logger.debug(`No change in ${pathWithContent.path}`);
      } else {
        logger.info(`update version in ${pathWithContent.path}`);
        fs.writeFileSync(pathWithContent.path, newContent);
      }
    });
};

void (async () => {
  let wrapper: CliWrapper = (fn: any) => fn;
  try {
    const { createCliWithMetrics } = await import('@o3r/telemetry');
    wrapper = createCliWithMetrics;
  } catch {
    // Do not throw if `@o3r/telemetry` is not installed
  }
  return wrapper(cliFn, '@o3r/workspace:set-version', { logger, preParsedOptions: options })();
})();
