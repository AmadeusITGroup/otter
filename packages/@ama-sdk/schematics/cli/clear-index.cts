#!/usr/bin/env node

/*
 * Remove deleted models' exports
 */

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

void (async () => {
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
})();
