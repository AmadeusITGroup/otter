#!/usr/bin/env node

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  program
} from 'commander';
import {
  sync as globbySync
} from 'globby';
import {
  clean
} from 'semver';
import * as winston from 'winston';

const defaultIncludedFiles = ['**/package.json', '!/**/templates/**/package.json', '!**/node_modules/**/package.json', '**/lerna.json'];

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
  .option('-v, --verbose', 'Display debug logs')
  .action((version: string) => {
    const cleanVersion = clean(version);
    if (!cleanVersion) {
      // eslint-disable-next-line no-console
      console.error(`The version "${version}" is invalid`);
      return process.exit(1);
    }
    replaceVersion = cleanVersion;
  })
  .parse(process.argv);

const options: any = program.opts();
logger.level = options.verbose ? 'debug' : 'info';

globbySync(options.include, { cwd: process.cwd() })
  .map((file: string) => path.join(process.cwd(), file))
  .map((filePath: string) => ({
    path: filePath,
    content: fs.readFileSync(filePath).toString()
  }))
  .forEach((pathWithContent: { path: string; content: string }) => {
    const newContent = pathWithContent.content
      .replace(new RegExp('"([~^]?)' + (options.placeholder as string).replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\\*\./g, '\\.') + '"', 'g'), `"$1${replaceVersion}"`)
      .replace(/"workspace:([~^]?)[^"]*"(,?)$/gm, `"$1${replaceVersion}"$2`);
    if (newContent === pathWithContent.content) {
      logger.debug(`No change in ${pathWithContent.path}`);
    } else {
      logger.info(`update version in ${pathWithContent.path}`);
      fs.writeFileSync(pathWithContent.path, newContent);
    }
  });
