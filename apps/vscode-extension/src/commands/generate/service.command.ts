/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { dirname, relative } from 'node:path';
import type { ExtensionContext } from 'vscode';
import * as vscode from 'vscode';
import { getPackageScriptRunner } from '../helpers';

/**
 * Generate service command
 *
 * @param _context
 * @param folder
 * @returns
 */
export function generateServiceGenerateCommand(_context: ExtensionContext, folder?: string) {
  const getCurrentFolder = () => {
    const currentlyOpenTabfilePath = vscode.window.activeTextEditor?.document.fileName;
    return currentlyOpenTabfilePath && relative(vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath || '.', dirname(currentlyOpenTabfilePath));
  };

  return async () => {
    const name = await vscode.window.showInputBox({
      title: 'Service name',
      ignoreFocusOut: true
    });

    if (!name) {
      await vscode.window.showErrorMessage('Service name is required');
      return;
    }

    const featureName = await vscode.window.showInputBox({
      title: 'Name of the service feature',
      placeHolder: 'base',
      ignoreFocusOut: true
    });

    const servicePath = folder || await vscode.window.showInputBox({
      title: 'Path to your services folder',
      value: getCurrentFolder() || vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath,
      ignoreFocusOut: true
    });

    const config = vscode.workspace.getConfiguration('otter.generate');
    const terminal = vscode.window.createTerminal('Otter Service generator');
    const defaultOptions = [
      `--skip-linter="${!!config.get<boolean>('skipLinter')}"`
    ];
    const options = [
      ...defaultOptions,
      `--feature-name="${featureName || 'base'}"`,
      ...(servicePath ? [`--path="${servicePath}" `] : [])
    ];
    terminal.sendText(`${getPackageScriptRunner()} ng generate @o3r/core:service ${options.join(' ')} "${name}"`, true);
    terminal.show();
  };
}
