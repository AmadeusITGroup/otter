import {
  dirname,
  relative
} from 'node:path';
import type {
  ExtensionContext
} from 'vscode';
import * as vscode from 'vscode';
import {
  getPackageScriptRunner,
  getSchematicDefaultOptions,
  stringifyOptions
} from '../helpers';

const getCurrentFolder = () => {
  const currentlyOpenTabfilePath = vscode.window.activeTextEditor?.document.fileName;
  return currentlyOpenTabfilePath && relative(vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath || '.', dirname(currentlyOpenTabfilePath));
};

/**
 * Generate service command
 * @param _context
 * @param folder
 */
export function generateServiceGenerateCommand(_context: ExtensionContext, folder?: string) {
  return async () => {
    const name = await vscode.window.showInputBox({
      title: 'Service name',
      ignoreFocusOut: true
    });

    if (!name) {
      await vscode.window.showErrorMessage('Service name is required');
      return;
    }

    const defaultOptions = await getSchematicDefaultOptions('@o3r/core:service') as Partial<{ featureName: string; path: string }>;

    const featureName = defaultOptions.featureName || await vscode.window.showInputBox({
      title: 'Name of the service feature',
      placeHolder: 'base',
      ignoreFocusOut: true
    });

    const servicePath = folder || await vscode.window.showInputBox({
      title: 'Path to your services folder',
      value: getCurrentFolder() || defaultOptions.path || vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath,
      ignoreFocusOut: true
    });

    const terminal = vscode.window.createTerminal('Otter Service generator');

    const options = [
      ...stringifyOptions(defaultOptions, servicePath ? ['path', 'featureName'] : ['featureName']),
      `--feature-name="${featureName || 'base'}"`,
      ...(servicePath ? [`--path="${servicePath}" `] : [])
    ];
    terminal.sendText(`${await getPackageScriptRunner()} ng generate @o3r/core:service ${options.join(' ')} "${name}"`, true);
    terminal.show();
  };
}
