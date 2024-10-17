
import { relative } from 'node:path';
import * as vscode from 'vscode';
import { findPathAndExecuteSchematic } from './common';

const getExtraOptions = async (): Promise<string[]> => {

  const activeEditor = vscode.window.activeTextEditor;
  const document = activeEditor?.document;
  const componentPath = document
    ? relative(
      vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath || '.',
      document.fileName.replace(/\.template\.html$/, '.component.ts')
    )
    : '';
  const selectedText = document?.getText(activeEditor?.selection);
  if (componentPath && selectedText) {
    const key = await vscode.window.showInputBox({
      placeHolder: 'keyName'
    }) || '';
    const description = await vscode.window.showInputBox({
      placeHolder: 'Description of the localization'
    }) || '';
    return [
      `--key="${key}"`,
      `--description="${description}"`,
      `--value="${selectedText}"`,
      `--path="${componentPath}"`,
      '--update-template'
    ];
  }
  return [];
};

export const generateAddLocalizationKeyToComponentCommand = findPathAndExecuteSchematic(
  '@o3r/localization:localization-key-to-component',
  getExtraOptions
);
