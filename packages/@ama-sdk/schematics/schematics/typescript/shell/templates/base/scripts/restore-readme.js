const cpx = require('cpx');
const path = require('node:path');
const util = require('util');
const rimraf = require('rimraf');

const copyFile = util.promisify(cpx.copy);
const rimrafDir = util.promisify(rimraf);

const root = path.resolve(__dirname, '..');

(async () => {
  await copyFile(path.posix.join(root, '.readme-backup', 'readme.md'), root);
  await rimrafDir(path.posix.join(root, '.readme-backup'));
})();
