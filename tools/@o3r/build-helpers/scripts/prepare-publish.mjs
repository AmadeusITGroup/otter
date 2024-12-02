/*
 * The purpose of this script is to prepare the artifact to be published on registries
 * This includes the following steps:
 *   - Duplicate selected field from the root folder package.json to targeted package.json(default: 'contributors', 'bugs', 'repository', 'license')
 *   - Copy License file
 */

import {
  copyFileSync,
  existsSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import {
  delimiter,
  dirname,
  join,
  normalize,
  resolve,
} from 'node:path';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));
const root = argv.root ? resolve(process.cwd(), argv.root) : process.cwd();
const /** @type { string[] } */ fields = argv.fields?.split(',') || ['contributors', 'bugs', 'repository', 'license', 'homepage'];
const appendPath = argv.append && normalize(argv.append);

/**
 * Find Private package.json
 * @param {string} currentFolder
 */
const findPrivatePackage = (currentFolder) => {
  const inspectedPackage = resolve(currentFolder, 'package.json');
  if (existsSync(inspectedPackage)) {
    const pck = JSON.parse(readFileSync(inspectedPackage, { encoding: 'utf8' }));
    if (pck.private) {
      return {
        content: pck,
        path: inspectedPackage
      };
    }
  }

  const parent = dirname(currentFolder);
  if (!parent || currentFolder === parent) {
    return null;
  }
  return findPrivatePackage(parent);
};

/**
 * Find closest readme files
 * @param {string} currentFolder
 */
const findReadme = (currentFolder) => {
  const readmePattern = /readme\.md$/i;
  const dir = readdirSync(currentFolder);
  const readmeFile = dir.find((file) => readmePattern.test(file));
  if (readmeFile) {
    return resolve(currentFolder, readmeFile);
  }

  const parent = dirname(currentFolder);
  if (!parent || currentFolder === parent) {
    return null;
  }
  return findReadme(parent);
};

/**
 * Update package.json, copy .npmignore, README.md and LICENSE into dist folder
 * @param {string} rootPath
 * @param {string} distPath
 * @param {string} packageJsonPath
 */
function preparePublish(rootPath, distPath, packageJsonPath) {
  const privatePackageJson = findPrivatePackage(rootPath);
  const distPackageJson = resolve(rootPath, packageJsonPath);

  if (!packageJsonPath || !existsSync(distPackageJson)) {
    throw new Error(`No package.json found for ${distPackageJson}`);
  }
  if (!privatePackageJson) {
    throw new Error('No private package.json found');
  }

  const packageJson = JSON.parse(readFileSync(distPackageJson, { encoding: 'utf8' }));
  fields.forEach((field) => packageJson[field] ||= privatePackageJson.content[field]);

  writeFileSync(distPackageJson, JSON.stringify(packageJson, null, 2));
  copyFileSync(resolve(dirname(privatePackageJson.path), 'LICENSE'), resolve(distPath, 'LICENSE'));

  const npmIgnoreFilePath = resolve(rootPath, '.npmignore');
  if (existsSync(npmIgnoreFilePath)) {
    copyFileSync(npmIgnoreFilePath, resolve(distPath, '.npmignore'));
  }

  const readmeDistPath = resolve(distPath, 'README.md');
  const readmeBasePath = findReadme(distPath);
  if (readmeBasePath) {
    copyFileSync(readmeBasePath, readmeDistPath);
  } else {
    // eslint-disable-next-line no-console -- only logger available
    console.warn(`No README.md file found for ${distPath}`);
  }
}

const distPaths = argv._.length > 0
  ? argv._
    .flatMap((files) => files.split(delimiter))
    .map((p) => appendPath ? join(p, appendPath) : p)
  : [resolve(process.cwd(), appendPath || 'dist')];

distPaths.forEach((distPath) => preparePublish(root, distPath, join(distPath, 'package.json')));
