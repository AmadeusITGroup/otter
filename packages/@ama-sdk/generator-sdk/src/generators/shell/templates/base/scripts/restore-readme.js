const cpx = require('cpx');
const path = require('path');
const util = require('util');
const rimraf = require('rimraf');

const copyFile = util.promisify(cpx.copy);
const rimrafDir = util.promisify(rimraf);

const root = path.resolve(__dirname, '..');

(async () => {
  await copyFile(path.join(root, '.readme-backup', 'readme.md'), root);
  await rimrafDir(path.join(root, '.readme-backup'));
})();
