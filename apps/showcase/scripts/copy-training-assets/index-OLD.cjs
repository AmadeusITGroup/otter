/**
 * Copy necessary assets for the Otter training
 */
const fs = require('node:fs');
const path = require('node:path');

// Packages with assets that must be copied in the project.json of the showcase
const trainingPackages = [
  '@vscode/codicons',
  // '@xterm/addon-fit',
  '@xterm/xterm',
  'monaco-editor',
  // 'ngx-monaco-editor-v2',
  'ngx-monaco-tree'
]

function getAbsolutePath(packageName) {
  const packageJsonPath = require.resolve(`${packageName}/package.json`);
  // // const posixPackageJsonPath = path.posix.basename(packageJsonPath);
  // const test = path.normalize(packageJsonPath.substring(packageJsonPath.indexOf('.yarn'), packageJsonPath.lastIndexOf('\\')));
  // return test;
  // return packageJsonPath.substring(packageJsonPath.indexOf('.yarn'), packageJsonPath.lastIndexOf('\\'));
  return packageJsonPath.substring(0, packageJsonPath.lastIndexOf('\\'));
}

const trainingPackagesAbsolutePaths = trainingPackages.map((packageName) => getAbsolutePath(packageName));
// trainingPackages.forEach((packageName) => {
//   // const packageJsonPath = require.resolve(`${package}/package.json`);
//   // const absolutePackagePath = packageJsonPath.substring(0, packageJsonPath.lastIndexOf('\\'));
//   const absolutePackagePath = getAbsolutePath(packageName);
//   console.log(absolutePackagePath);
// })

const trainingPackagesAssetsPaths = [
  // @vscode/codicons
  path.join(trainingPackagesAbsolutePaths[0], 'dist/codicon.css'),
  // @xterm/xterm
  path.join(trainingPackagesAbsolutePaths[1], 'css/xterm.css'),
  // monaco-editor
  trainingPackagesAbsolutePaths[2],
  // ngx-monaco-tree
  path.join(trainingPackagesAbsolutePaths[3], 'assets')
]
const trainingPackagesAssetsPaths2 = {
  // @vscode/codicons
  'vscode': path.join(trainingPackagesAbsolutePaths[0], 'dist/codicon.css'),
  // @xterm/xterm
  'xterm': path.join(trainingPackagesAbsolutePaths[1], 'css/xterm.css'),
  // monaco-editor
  'monaco-editor': trainingPackagesAbsolutePaths[2],
  // ngx-monaco-tree
  'ngx-monaco-tree': path.join(trainingPackagesAbsolutePaths[3], 'assets')
}
console.log(trainingPackagesAssetsPaths);

// const temporaryAssetsDirectory = path.join(process.cwd(), '..', '..', 'training-assets');
const temporaryAssetsDirectory = path.join(process.cwd(), 'training-assets');
console.log(temporaryAssetsDirectory);
// fs.cpSync(trainingPackagesAssetsPaths[0], temporaryAssetsDirectory, {recursive: true});
// trainingPackagesAssetsPaths.forEach((path) => fs.cp(path, temporaryAssetsDirectory, {recursive: true}));
Object.keys(trainingPackagesAssetsPaths2).forEach((key) => {
  const destinationDir = `${temporaryAssetsDirectory}/${key}`;
  if (!fs.existsSync(destinationDir)){
    fs.mkdirSync(destinationDir, { recursive: true });
  }
  fs.cpSync(trainingPackagesAssetsPaths2[key], destinationDir, {recursive: true});
})


// old code
// const vscodePath = path.join(getAbsolutePath('@vscode/codicons'), 'dist/codicon.css');
// const vscodeDestinationPath = `${temporaryAssetsDirectory}/@vscode/codicons/dist/codicon.css`;
