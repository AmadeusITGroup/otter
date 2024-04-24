#!/usr/bin/env node

/*
 * Remove deleted models' exports
 */

import { promises as fs, statSync } from 'node:fs';
import { resolve } from 'node:path';

const baseDir = resolve(process.cwd(), 'src', 'models', 'base');

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
