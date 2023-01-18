const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '..', 'src', 'models', 'base');

void (async () => {
  const models = await new Promise((resolve, reject) => fs.readdir(baseDir, (err, files) => err ? reject(err) : resolve(files)));
  const shouldRemoveModels = (
    await Promise.all(
      models
        .filter((file) => fs.statSync(path.resolve(baseDir, file)).isDirectory())
        .map((model) => new Promise(
          (resolve, reject) => fs.readdir(path.resolve(baseDir, model), (err, files) => err ? reject(err) : resolve({ model, removeIndex: files.length === 1 })))
        )
    )
  ).filter(({ removeIndex }) => removeIndex)
    .map(({ model }) => model);

  await Promise.all(
    shouldRemoveModels
      .map((model) => {
        console.warn(`Removing ${model} model`);
        return new Promise((resolve, reject) => fs.unlink(path.resolve(baseDir, model, 'index.ts'), (err) => err ? reject(err) : resolve()));
      })
  );
})();
