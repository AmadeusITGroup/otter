#!/usr/bin/env node

import commander from 'commander';
import fs from 'node:fs';
import { sync as globbySync } from 'globby';
import path from 'node:path';
import process from 'node:process';

import { Report } from '../core/checkers/checker.interface';
import { MultiSuccessChecker } from '../core/checkers/multi-success-checker';
import { getTargetInformation, isGlobPattern } from '../core/utils';

process.on('unhandledRejection', (err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

const myPackageJson: { version: string } = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', 'package.json'), 'utf8'));

const program = new commander.Command('swagger-multi-success-check');
program.version(myPackageJson.version);
program.description('Validate that there is no path returning two different success response definitions in the specification');

program.arguments('[(swagger-spec|api-configuration|npm-package|glob)...]');
program.action(async (inputs: string[] = []) => {
  inputs = inputs.reduce<string[]>((acc, cur) => {
    if (isGlobPattern(cur)) {
      acc.push(...globbySync(cur, { cwd: process.cwd(), onlyFiles: false }));
    } else {
      acc.push(cur);
    }
    return acc;
  }, []);

  const checker = new MultiSuccessChecker();
  const reports: { [swaggerSpec: string]: Report } = {};
  for (const specPath of inputs) {
    const spec = await getTargetInformation(specPath);
    const report = await checker.check(spec);
    if (report && report.length) {
      reports[specPath] = report;
    }
  }

  Object.keys(reports)
    .forEach((spec) => {
      // eslint-disable-next-line no-console
      console.error(`issue on Swagger specification ${spec} :`);
      reports[spec]
        .forEach((error) => {
          // eslint-disable-next-line no-console
          console.error(error.message);
          if (error.details) {
            // eslint-disable-next-line no-console
            error.details.forEach((detail) => console.warn(`  ${detail}`));
          }
        });
    });

  if (Object.keys(reports).length) {
    process.exit(1);
  }
});

program.parse(process.argv);
