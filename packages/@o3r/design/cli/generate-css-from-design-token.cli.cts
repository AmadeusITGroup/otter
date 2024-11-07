#!/usr/bin/env node

import {
  existsSync
} from 'node:fs';
import {
  isAbsolute,
  normalize,
  resolve
} from 'node:path';
import type {
  CliWrapper
} from '@o3r/telemetry';
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

const run = async () => {
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
        // eslint-disable-next-line no-console -- no logger available
        console.warn(`A duplication of the variable ${key} is found in ${file}.`);
      }
      acc.set(key, variable);
    });
    return acc;
  }, new Map());

  await renderDesignTokens(tokens, renderDesignTokenOptions);
};

void (async () => {
  let wrapper: CliWrapper = (fn: any) => fn;
  try {
    const { createCliWithMetrics } = await import('@o3r/telemetry');
    wrapper = createCliWithMetrics;
  } catch {
    // Do not throw if `@o3r/telemetry` is not installed
  }
  return wrapper(run, '@o3r/design:build-design-token')();
})();
