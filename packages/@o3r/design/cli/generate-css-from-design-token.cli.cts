#!/usr/bin/env node

import { isAbsolute, normalize, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { parseDesignTokenFile, renderDesignTokens } from '@o3r/design';
import type { DesignTokenRendererOptions, DesignTokenVariableSet } from '@o3r/design';
import * as minimist from 'minimist';

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
      acc.set(key, variable);
      console.warn(`A duplication of the variable ${key} is found in ${file}`);
    });
    return acc;
  }, new Map());

  await renderDesignTokens(tokens, renderDesignTokenOptions);
})();
