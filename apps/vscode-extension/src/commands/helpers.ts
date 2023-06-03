import { lstatSync } from 'node:fs';
import { dirname, relative } from 'node:path';
import * as vscode from 'vscode';

/**
 * Get the local path of the folder of the current open file
 */
export const getCurrentFolder = () => {
  const currentlyOpenTabfilePath = vscode.window.activeTextEditor?.document.fileName;
  return currentlyOpenTabfilePath && relative(vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath || '.', dirname(currentlyOpenTabfilePath));
};

/**
 * Wrap a command to add the folder path when activated from explorer context
 *
 * @param context vscode context
 * @param command command to execute
 */
export const wrapCommandWhenExplorerContext = (
  context: vscode.ExtensionContext,
  command: (context: vscode.ExtensionContext, folder?: string) => () => Promise<void>
) => {
  return (targetResource: vscode.Uri) => {
    const folderPath = vscode.workspace.asRelativePath(lstatSync(targetResource.path).isDirectory() ? targetResource.path : dirname(targetResource.path));
    return command(context, folderPath)();
  };
};

/**
 * Get the runner for NPM scripts
 */
export const getPackageScriptRunner = () => {
  const packageManager = vscode.workspace.getConfiguration('otter').get<string>('packageManager', 'npm');
  return packageManager === 'npm' ? 'npx' : packageManager;
};
