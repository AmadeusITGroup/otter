const { existsSync } = require('node:fs');
const { readFile, writeFile } = require('node:fs/promises');
const { platform } = require('node:os');
const { join } = require('node:path');
const { watch } = require('chokidar');
const minimist = require('minimist');

const manifestPath = join(__dirname, '..', 'dist', 'manifest.json');
const argv = minimist(process.argv.slice(2));
const { version } = require('../package.json');

/**
 * Remove $schema field from manifest.json and align version with the package.json
 * @param {string} file path to manifest.json
 */
const removeSchema = async (file) => {
  if (existsSync(file)) {
    const content = JSON.parse(await readFile(file, { encoding: 'utf8' }));
    content.version = version.replace(/[A-Za-z\-].*$/, '');
    if (content.$schema) {
      delete content.$schema;
    }
    await writeFile(file, JSON.stringify(content, null, 2));
  }
};

if (argv.watch) {
  watch(join(__dirname, '..', 'dist', '**', 'manifest.json').replace(/\\/g, '/'), { ignoreInitial: true, awaitWriteFinish: true, usePolling: platform().startsWith('win') })
    .on('all', (_event, file) => removeSchema(file));
} else {
  void removeSchema(manifestPath);
}
