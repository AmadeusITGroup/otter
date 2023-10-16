#!/usr/bin/env node

/*
 * Remove deleted models' exports
 */

import { readdir, statSync, unlink } from 'node:fs';
import { resolve } from 'node:path';

const baseDir = resolve(process.cwd(), 'src', 'models', 'base');

void (async () => {
  const models = await new Promise<string[]>((res, reject) => readdir(baseDir, (err, files) => err ? reject(err) : res(files)));
  const shouldRemoveModels = (
    await Promise.all(
      models
        .filter((file) => statSync(resolve(baseDir, file)).isDirectory())
        .map((model) => new Promise<{model: string; removeIndex: boolean}>(
          (res, reject) => readdir(resolve(baseDir, model), (err, files) => err ? reject(err) : res({ model, removeIndex: files.length === 1 })))
        )
    )
  ).filter(({ removeIndex }) => removeIndex)
    .map(({ model }) => model);

  await Promise.all(
    shouldRemoveModels
      .map((model) => {
        console.warn(`Removing ${model} model`);
        return new Promise<void>((res, reject) => unlink(resolve(baseDir, model, 'index.ts'), (err) => err ? reject(err) : res()));
      })
  );
})();
