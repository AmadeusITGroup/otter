const { readFile, writeFile } = require('node:fs/promises');
const { join } = require('node:path');

const manifestPath = join(__dirname, '..', 'dist', 'manifest.json');
const { version } = require(join(__dirname, '..', 'dist', 'package.json'));

/**
 * align the manifest version with the package.json version
 * @param {string} file path to manifest.json
 */
const updateVersion = async (file) => {
  const content = JSON.parse(await readFile(file, { encoding: 'utf8' }));
  content.version = version;
  await writeFile(file, JSON.stringify(content, null, 2));
};

void updateVersion(manifestPath);
