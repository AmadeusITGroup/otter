/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { dirname, relative, resolve} from 'node:path';
import type { ExtensionContext } from 'vscode';
import * as vscode from 'vscode';
import { getPackageScriptRunner } from '../helpers';

/**
 * Generate new Otter Module command
 *
 * @param _context
 * @param folder
 * @returns
 */
export function generateModuleGenerateCommand(_context: ExtensionContext, folder?: string) {
  const getCurrentFolder = () => {
    const currentlyOpenTabfilePath = vscode.window.activeTextEditor?.document.fileName;
    return currentlyOpenTabfilePath && relative(vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath || '.', dirname(currentlyOpenTabfilePath));
  };

  return async () => {
    const config = vscode.workspace.getConfiguration('otter.generate');

    const name = await vscode.window.showInputBox({
      title: 'Module name',
      ignoreFocusOut: true
    });

    if (!name) {
      await vscode.window.showErrorMessage('Module name is required');
      return;
    }

    const modulePath = folder || config.get<string>('module.path') || await vscode.window.showInputBox({
      title: 'Path to your Modules folder',
      value: getCurrentFolder() || resolve(vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath || '.', 'packages'),
      ignoreFocusOut: true
    });

    const terminal = vscode.window.createTerminal('Otter Module generator');
    const defaultOptions = [
      `--skip-linter="${!!config.get<boolean>('skipLinter')}"`,
      `-prefix="${config.get<boolean>('module.prefix') || ''}"`
    ];
    const options = [
      ...defaultOptions,
      ...(modulePath ? [`--path="${modulePath}" `] : [])
    ];
    terminal.sendText(`${getPackageScriptRunner()} ng generate @o3r/core:module ${options.join(' ')} "${name}"`, true);
    terminal.show();
  };
}
