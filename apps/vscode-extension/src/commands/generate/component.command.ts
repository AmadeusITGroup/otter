import type {
  ExtensionContext
} from 'vscode';
import * as vscode from 'vscode';
import {
  getCurrentFolder,
  getPackageScriptRunner,
  getSchematicDefaultOptions,
  stringifyOptions
} from '../helpers';

/**
 * Generate component command
 * @param _context
 * @param folder
 * @returns
 */
export function generateComponentGenerateCommand(_context: ExtensionContext, folder?: string) {
  return async () => {
    const componentName = await vscode.window.showInputBox({
      title: 'Specify your component Name',
      ignoreFocusOut: true
    });

    if (!componentName) {
      await vscode.window.showErrorMessage('Component name is required');
      return;
    }

    const defaultOptions = await getSchematicDefaultOptions('@o3r/core:component');

    const componentPath = folder || await vscode.window.showInputBox({
      title: 'Path to your component',
      value: getCurrentFolder() || defaultOptions.path || vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath,
      ignoreFocusOut: true
    });

    const componentStructure = await vscode.window.showQuickPick(['full', 'container', 'presenter'], {
      canPickMany: false,
      ignoreFocusOut: true,
      title: 'Specify the structure of the component you want to generate'
    });

    if (!componentStructure) {
      await vscode.window.showErrorMessage('Component structure is required');
      return;
    }

    const description = await vscode.window.showInputBox({
      ignoreFocusOut: true,
      title: 'Specify your component description'
    });

    const terminal = vscode.window.createTerminal('Otter Component generator');
    const options = [
      ...stringifyOptions(defaultOptions, componentPath ? ['path'] : []),
      `--component-structure="${componentStructure}"`,
      `--description="${description || ''}"`,
      ...(componentPath ? [`--path="${componentPath}" `] : [])
    ];
    terminal.sendText(`${await getPackageScriptRunner()} ng generate @o3r/core:component ${options.join(' ')} "${componentName}"`, true);
    terminal.show();
  };
}
