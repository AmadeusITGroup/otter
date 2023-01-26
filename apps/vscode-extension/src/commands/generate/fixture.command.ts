/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { ExtensionContext } from 'vscode';
import * as vscode from 'vscode';

const availableMethods: string[] = [
  'clickOnButton',
  'getText',
  'getInputValue',
  'setInputValue',
  'getTextInList',
  'clickButtonInList',
  'getNumberOfItems'
];

const isHTMLTemplateDocument = (doc: vscode.TextDocument | undefined) => {
  return doc?.fileName.endsWith('template.html');
};

/**
 * Generate component command
 *
 * @param _context
 * @returns
 */
export function generateFixtureGenerateCommand(_context: ExtensionContext) {
  return async () => {
    const activeEditor = vscode.window.activeTextEditor;
    const document = activeEditor?.document;
    const textSelected = document?.getText(activeEditor?.selection);
    if (isHTMLTemplateDocument(document) && textSelected) {
      const fixtureDocUri = vscode.Uri.file(document?.uri?.path.replace('template.html', 'fixture.ts')!);


      const chosenMethods = await vscode.window.showQuickPick(availableMethods, {
        placeHolder: 'Select the type of fixture you want to create',
        canPickMany: true
      });

      if (chosenMethods?.length) {
        const terminal = vscode.window.createTerminal('Otter Component generator');
        const relativePath = vscode.workspace.asRelativePath(fixtureDocUri.path);

        const config = vscode.workspace.getConfiguration('otter.generate');
        const defaultOptions = [
          `--skip-linter ${!!config.get<boolean>('skipLinter')}`
        ];
        const fixtureDoc = await vscode.workspace.openTextDocument(fixtureDocUri);
        const options = [
          ...defaultOptions,
          `--path ${relativePath}`,
          ...chosenMethods.map((m) => `--methods ${m}`),
          `--selector="${textSelected.split(' ').map((cl) => `.${cl}`)}"`
        ];
        terminal.sendText(`yarn ng generate @o3r/core:fixture ${options.join(' ')}`, true);
        terminal.show();
        void vscode.window.showTextDocument(fixtureDoc);
      } else {
        void vscode.window.showInformationMessage('No fixture type selected');
      }


    } else {
      void vscode.window.showInformationMessage(textSelected
        ? 'File is not a html template file'
        : 'No selected text'
      );
    }
  };
}
