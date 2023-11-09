const cpx = require('cpx');
const path = require('node:path');
const util = require('util');
const minimist = require('minimist');

const copyFile = util.promisify(cpx.copy);

const root = path.resolve(__dirname, '..');
const argv = minimist(process.argv.slice(2));
const folderName = argv.folderName || '<% if (projectName) { %>@<%=projectName%>/<% } %><%=projectPackageName%>';

(async () => {
  await copyFile(path.join(root, 'readme.md'), path.join(root, '.readme-backup'));
  await copyFile(path.join(root, 'packages', folderName, 'readme.md'), root);
})();
