#!/usr/bin/env node

/*
 * Remove deleted models' exports
 */

import type { CliWrapper } from '@o3r/telemetry';
import * as minimist from 'minimist';
import { promises as fs, statSync } from 'node:fs';
import { resolve } from 'node:path';

const argv = minimist(process.argv.slice(2));
const { help } = argv;
const baseDir = resolve(process.cwd(), 'src', 'models', 'base');

if (help) {
  // eslint-disable-next-line no-console
  console.log(`Remove the index files that are no longer necessary after the deletion of the associated model.
  Usage: amasdk-clear-index
  `);
  process.exit(0);
}

const run = async () => {
  const models = await fs.readdir(baseDir);
  const shouldRemoveModels = (
    await Promise.all(
      models
        .filter((file) => statSync(resolve(baseDir, file)).isDirectory())
        .map(async (model) => {
          const files = await fs.readdir(resolve(baseDir, model));
          return { model, removeIndex: files.length === 1 };
        })
    )
  ).filter(({ removeIndex }) => removeIndex)
    .map(({ model }) => model);

  await Promise.all(
    shouldRemoveModels
      .map((model) => {
        console.warn(`Removing ${model} model`);
        return fs.unlink(resolve(baseDir, model, 'index.ts'));
      })
  );
};

void (async () => {
  let wrapper: CliWrapper = (fn: any) => fn;
  try {
    const { createCliWithMetrics } = await import('@o3r/telemetry');
    wrapper = createCliWithMetrics;
  } catch {
    // Do not throw if `@o3r/telemetry` is not installed
  }
  return wrapper(run, '@ama-sdk/schematics:clear-index')();
})();
