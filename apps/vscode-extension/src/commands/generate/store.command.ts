/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { dirname, relative } from 'node:path';
import type { ExtensionContext } from 'vscode';
import * as vscode from 'vscode';
import { getPackageScriptRunner, getSchematicDefaultOptions, stringifyOptions } from '../helpers';

/**
 * Generate store command
 * @param _context
 * @param folder
 * @returns
 */
export function generateStoreGenerateCommand(_context: ExtensionContext, folder?: string) {
  const getCurrentFolder = () => {
    const currentlyOpenTabfilePath = vscode.window.activeTextEditor?.document.fileName;
    return currentlyOpenTabfilePath && relative(vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath || '.', dirname(currentlyOpenTabfilePath));
  };

  return async () => {
    const storeType = await vscode.window.showQuickPick(['entity-async', 'simple-async', 'entity-sync', 'simple-sync'], {
      canPickMany: false,
      ignoreFocusOut: true,
      title: 'Which type of store do you want to create ? \n' +
        'The entity store contains a collection of items in the state, while the simple one contains only one.\n' +
        'The async store is designed to interact with an api, and handles the asynchronous call via effects.'
    });

    if (!storeType) {
      await vscode.window.showErrorMessage('Store type is required');
      return;
    }

    const storeName = await vscode.window.showInputBox({
      title: 'Name of the Store',
      ignoreFocusOut: true
    });

    if (!storeName) {
      await vscode.window.showErrorMessage('Store name is required');
      return;
    }

    const clipboardContent = await vscode.env.clipboard.readText();
    const modelName = await vscode.window.showInputBox({
      title: 'The SDK Model to use as store item',
      placeHolder: 'e.g. AirOffer',
      value: /^[a-zA-Z]+$/.test(clipboardContent) ? clipboardContent : undefined,
      ignoreFocusOut: true
    });

    if (!modelName) {
      await vscode.window.showErrorMessage('Store model name is required');
      return;
    }

    let modelIdPropName = await vscode.window.showInputBox({
      title: 'The property name that identifies the model',
      value: 'id',
      ignoreFocusOut: true
    });

    if (!modelIdPropName) {
      modelIdPropName = 'id';
    }

    const defaultOptions = await getSchematicDefaultOptions('@o3r/core:service');

    const storePath = folder || await vscode.window.showInputBox({
      title: 'Path to your store folder',
      value: getCurrentFolder() || defaultOptions.path || vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath,
      ignoreFocusOut: true
    });

    const terminal = vscode.window.createTerminal('Otter Store generator');

    const options = [
      ...stringifyOptions(defaultOptions, storePath ? ['path'] : []),
      ...(storePath ? [`--path="${storePath}" `] : []),
      `--store-type="${storeType}"`,
      `--store-name="${storeName}"`,
      `--model-name="${modelName}"`,
      `--model-id-prop-name="${modelIdPropName}"`
    ];
    terminal.sendText(`${await getPackageScriptRunner()} ng generate @o3r/core:store ${options.join(' ')} "${storeType}"`, true);
    terminal.show();
  };
}
