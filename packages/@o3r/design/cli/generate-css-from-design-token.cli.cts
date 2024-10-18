#!/usr/bin/env node

import {
  existsSync
} from 'node:fs';
import {
  isAbsolute,
  normalize,
  resolve
} from 'node:path';
import * as minimist from 'minimist';
import {
  parseDesignTokenFile,
  renderDesignTokens
} from '../src/public_api';
import type {
  DesignTokenRendererOptions,
  DesignTokenVariableSet
} from '../src/public_api';

const args = minimist(process.argv.splice(2));

void (async () => {
  const renderDesignTokenOptions: DesignTokenRendererOptions = {};

  const output = args.o || args.output;
  if (output) {
    renderDesignTokenOptions.determineFileToUpdate = () => resolve(process.cwd(), output);
  }

  const tokens = (await Promise.all(
    args._
      .map((file) => isAbsolute(file) ? normalize(file) : resolve(process.cwd(), file))
      .filter((file) => {
        const res = existsSync(file);
        if (!res) {
          throw new Error(`The file ${file} does not exist, the process will stop`);
        }
        return res;
      })
      .map(async (file) => ({ file, parsed: await parseDesignTokenFile(file) }))
  )).reduce<DesignTokenVariableSet>((acc, { file, parsed }) => {
    parsed.forEach((variable, key) => {
      if (acc.has(key)) {
        console.warn(`A duplication of the variable ${key} is found in ${file}.`);
      }
      acc.set(key, variable);
    });
    return acc;
  }, new Map());

  await renderDesignTokens(tokens, renderDesignTokenOptions);
})();
