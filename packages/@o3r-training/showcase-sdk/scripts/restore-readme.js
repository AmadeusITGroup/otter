const fs = require('node:fs');
const path = require('node:path');
const util = require('node:util');
const rimraf = require('rimraf');

const rimrafDir = util.promisify(rimraf);

const root = path.resolve(__dirname, '..');

(async () => {
  await fs.promises.copyFile(path.join(root, '.readme-backup', 'readme.md'), path.join(root, 'readme.md'));
  await rimrafDir(path.join(root, '.readme-backup'));
})();
