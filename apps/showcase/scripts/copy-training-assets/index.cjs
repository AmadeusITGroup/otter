/**
 * Copy necessary assets for the Otter training
 */
const fs = require('node:fs');
const path = require('node:path');

const temporaryAssetsDirectory = path.resolve(__dirname, '..', '..', 'training-assets');

function getAbsolutePath(packageName) {
  const packageJsonPath = require.resolve(`${packageName}/package.json`);
  return path.dirname(packageJsonPath);
}

// @vscode/codicons
const vscodePath = path.join(getAbsolutePath('@vscode/codicons'), 'dist');
const vscodeDestinationPath = `${temporaryAssetsDirectory}/@vscode/codicons/dist`;
fs.cpSync(vscodePath, vscodeDestinationPath, { recursive: true });

// @xterm/xterm
const xtermPath = path.join(getAbsolutePath('@xterm/xterm'), 'css/xterm.css');
const xtermDestinationPath = `${temporaryAssetsDirectory}/@xterm/xterm/css/xterm.css`;
fs.cpSync(xtermPath, xtermDestinationPath, { recursive: true });

// monaco-editor
const monacoEditorPath = path.join(getAbsolutePath('monaco-editor'));
const monacoEditorDestinationPath = `${temporaryAssetsDirectory}/monaco-editor`;
fs.cpSync(monacoEditorPath, monacoEditorDestinationPath, { recursive: true });

// ngx-monaco-tree
const ngxMonacoTreePath = path.join(getAbsolutePath('ngx-monaco-tree'), 'assets');
const ngxMonacoTreeDestinationPath = `${temporaryAssetsDirectory}/ngx-monaco-tree/assets`;
fs.cpSync(ngxMonacoTreePath, ngxMonacoTreeDestinationPath, { recursive: true });
