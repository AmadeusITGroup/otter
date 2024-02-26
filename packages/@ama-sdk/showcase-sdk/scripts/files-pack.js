const chokidar = require('chokidar');
const minimist = require('minimist');
const path = require('node:path');
const { sync } = require('globby');
const fs = require('node:fs').promises;
const promisify = require('util').promisify;

const argv = minimist(process.argv.slice(2));
const distFolder = argv.dist || 'dist';
const {watch, noExports} = argv;

const baseDir = path.resolve(__dirname, '..');

const files = [
  'README.md',
  'LICENSE',
  'package.json',
  'src/**/package.json'
];

/**  Update package.json exports */
const updateExports = async () => {
  const packageJson = JSON.parse(await fs.readFile(path.join(baseDir, 'package.json'), { encoding: 'utf8' }));
  const packageJsonFiles = sync(path.join(baseDir, distFolder, '*', '**', 'package.json'), {absolute: true});
  packageJson.exports = packageJson.exports || {};
  for (const packageJsonFile of packageJsonFiles) {
    try {
      const subPackageJson = JSON.parse(await fs.readFile(packageJsonFile, { encoding: 'utf8' }));
      const folder = './' + path.relative(path.join(baseDir, distFolder), path.dirname(packageJsonFile)).replace(/[/\\]+/g, '/');
      packageJson.exports[folder] = packageJson.exports[folder] || {};
      Object.entries(subPackageJson).forEach(([key, value]) => {
        if (['name', 'sideEffects'].includes(key)) {
          return;
        }
        packageJson.exports[folder][key] = './' + path.relative(path.join(baseDir, distFolder), path.resolve(path.dirname(packageJsonFile), value)).replace(/[/\\]+/g, '/');
      });
      packageJson.exports[folder].import = packageJson.exports[folder].module || packageJson.exports[folder].esm2020 || packageJson.exports[folder].esm2015 || packageJson.exports[folder].node;
      packageJson.exports[folder].require = packageJson.exports[folder].node;
      packageJson.exports[folder].main = packageJson.exports[folder].import || packageJson.exports[folder].require;
    } catch (e) {
      if (watch) {
        console.warn(`Exception in ${packageJsonFile}`, e);
      } else {
        throw e;
      }
    }
  }
  delete packageJson.scripts;
  await fs.writeFile(path.join(baseDir, distFolder, 'package.json'), JSON.stringify(packageJson, null, 2));
};

(async () => {

  // Move files into the dist folder
  const copies = files.reduce((acc, glob) => {
    if (watch) {
      acc.push(
        // eslint-disable-next-line no-console
        chokidar.watch(glob, {cwd: baseDir}).on('all', async (_event, file) => {
          await fs.copyFile(path.resolve(baseDir, file), path.resolve(baseDir, distFolder, file))
          console.log(`${e.srcPath} copied to ${e.dstPath}`);
          if (!noExports) {
            void updateExports()
          }
        })
      );
    } else {
      acc.push(...sync(glob, { cwd: baseDir, absolute: false })
        .map((file) => fs.copyFile(path.resolve(baseDir, file), path.resolve(baseDir, distFolder, file)))
      );
    }
    return acc;
  }, []);
  await Promise.all(copies);

  // Edit package.json exports
  if (!noExports && !watch) {
    await updateExports();
  }
})();
