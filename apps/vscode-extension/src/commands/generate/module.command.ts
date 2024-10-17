
import { dirname, relative, resolve} from 'node:path';
import type { ExtensionContext } from 'vscode';
import * as vscode from 'vscode';
import { getPackageScriptRunner, getSchematicDefaultOptions, stringifyOptions } from '../helpers';

/**
 * Generate new Otter Module command
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
    const name = await vscode.window.showInputBox({
      title: 'Module name',
      ignoreFocusOut: true
    });

    if (!name) {
      await vscode.window.showErrorMessage('Module name is required');
      return;
    }

    const defaultOptions = await getSchematicDefaultOptions('@o3r/core:module');

    const modulePath = folder || await vscode.window.showInputBox({
      title: 'Path to your Modules folder',
      value: getCurrentFolder() || defaultOptions.path || resolve(vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath || '.', 'packages'),
      ignoreFocusOut: true
    });

    const terminal = vscode.window.createTerminal('Otter Module generator');
    const options = [
      ...stringifyOptions(defaultOptions, modulePath ? ['path'] : []),
      ...(modulePath ? [`--path="${modulePath}" `] : [])
    ];
    terminal.sendText(`${await getPackageScriptRunner()} ng generate @o3r/core:module ${options.join(' ')} "${name}"`, true);
    terminal.show();
  };
}
