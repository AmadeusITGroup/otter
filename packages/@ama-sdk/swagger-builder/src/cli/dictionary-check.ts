#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import commander from 'commander';
import {
  sync as globbySync,
} from 'globby';
import {
  isGlobPattern,
} from '../core/utils';
import {
  checkDictionaries,
} from '../helpers/dictionary-check';

process.on('unhandledRejection', (err) => {
  // eslint-disable-next-line no-console -- no logger available
  console.error(err);
  process.exit(1);
});

const myPackageJson: { version: string } = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', 'package.json'), 'utf8'));

const program = new commander.Command('swagger-dictionary-check');
program.version(myPackageJson.version);
program.description('Validate that the dictionaries linked via the X Vendors are valid');

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

  const reports = await checkDictionaries(inputs);

  Object.keys(reports)
    .forEach((spec) => {
      // eslint-disable-next-line no-console -- no logger available
      console.error(`issue on Swagger specification ${spec} :`);
      reports[spec]
        .forEach((error) => {
          // eslint-disable-next-line no-console -- no logger available
          console.error(error.message);
          if (error.details) {
            // eslint-disable-next-line no-console -- no logger available
            error.details.forEach((detail) => console.warn(detail));
          }
        });
    });

  if (Object.keys(reports).length > 0) {
    process.exit(1);
  }
});

program.parse(process.argv);
