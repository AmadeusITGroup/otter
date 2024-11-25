const fs = require('node:fs');
const path = require('node:path');
const util = require('util');
const minimist = require('minimist');

const root = path.resolve(__dirname, '..');
const argv = minimist(process.argv.slice(2));
const folderName = argv.folderName || '@o3r-training/showcase-sdk';

(async () => {
  await fs.promises.copyFile(path.join(root, 'readme.md'), path.join(root, '.readme-backup', 'readme.md'));
  await fs.promises.copyFile(path.join(root, 'packages', folderName, 'readme.md'), path.join(root, 'readme.md'));
})();
