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

let packageJsonPath: string | undefined;

program
  .arguments('[package.json file]')
  .description('[DEPRECATED] Edit package.json to export the files')
  .option('-i, --ignore <pattern>', 'An array of glob patterns to exclude matches', collect, [])
  .option('-S, --source-folder <path>', 'Source folder', 'src/')
  .option('--verbose', 'Display debug log message')
  .action((actionPackageJsonPath = 'package.json') => {

    packageJsonPath = path.resolve(process.cwd(), actionPackageJsonPath);
  })
  .parse(process.argv);

const opts = program.opts();

const logger = winston.createLogger({
  level: opts.verbose ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: new winston.transports.Console()
});
logger.warn('This script is deprecated, will be removed in Otter v12.');

let files: string[] = [];
files.push(
  // List the folders in the src/ folder
  ...globbySync('*/', {cwd: path.resolve(process.cwd(), opts.sourceFolder), dot: true, onlyDirectories: true})
    .map((folder) => folder.replace(/[\\/]$/i, '') + '/')
);

files.push(
  // List the files in the src/ folder
  ...globbySync('*', {cwd: path.resolve(process.cwd(), opts.sourceFolder), dot: true, onlyFiles: true, ignore: opts.ignore})
    .map((file) => {
      const ext = path.extname(file);
      // replace extension by ".*"
      return file.replace(new RegExp(ext + '$', 'i'), '.*');
    })
);

const packageJsonFile = path.resolve(process.cwd(), packageJsonPath || 'package.json');
const packageJson: { [x: string]: any } = JSON.parse(fs.readFileSync(packageJsonFile, { encoding: 'utf8' }));

files.push(
  // Keep the patterns already defined in package.json
  ...packageJson.files.filter((file: string) => files.indexOf(file) === -1)
);

// remove duplicate RegExps
files = files.reduce((acc, file) => {
  const reg = new RegExp('^' + file.replace(/\\*\./ig, '\\.').replace(/\\*\*/ig, '[^\\/]*') + '$');
  return acc.filter((f) => f === file || !reg.test(f));
}, [...files]);

// Print the new list of files to export
packageJson.files = files;
fs.writeFileSync(packageJsonFile, JSON.stringify(packageJson, null, 2) + '\n');

files
  .forEach((file) => logger.debug(`Added ${file} in ${packageJson.name as string} package.json`));
