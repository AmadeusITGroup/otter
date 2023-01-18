#!/usr/bin/env node

import { program } from 'commander';
import { sync as globbySync } from 'globby';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as winston from 'winston';

const collect = (pattern: string, patterns: string[]) => {
  patterns.push(pattern);
  return patterns;
};

let replaceVersion: string;
program
  .arguments('<version>')
  .description('Replace the packages version in a monorepos')
  .option('-p, --placeholder <placeholder>', 'Pattern of the version placeholder', '0.0.0(-placeholder)?')
  .option('--include <file>', 'Add files pattern to apply the version replacement', collect, ['*/lerna.json', '**/package.json', '!**/node_modules/**/{package,lerna}.json'])
  .option('-v, --verbose', 'Display debug logs')
  .action((version: string) => {
    replaceVersion = version;
  })
  .parse(process.argv);

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: new winston.transports.Console()
});

const options: any = program.opts();
logger.level = options.verbose ? 'debug' : 'info';

globbySync(options.include, {cwd: process.cwd()})
  .map((file: string) => path.join(process.cwd(), file))
  .map((filePath: string) => ({
    path: filePath,
    content: fs.readFileSync(filePath).toString()
  }))
  .forEach((pathWithContent: {path: string; content: string}) => {
    const newContent = pathWithContent.content
      .replace(new RegExp('"([~^]?)' + (options.placeholder as string).replace(/\./g, '\\.') + '"', 'g'), `"$1${replaceVersion}"`)
      .replace(/"workspace:([~^]?)[^"]*"(,?)$/gm, `"$1${replaceVersion}"$2`);
    if (newContent !== pathWithContent.content) {
      logger.info(`update version in ${pathWithContent.path}`);
      fs.writeFileSync(pathWithContent.path, newContent);
    } else {
      logger.debug(`No change in ${pathWithContent.path}`);
    }
  });
