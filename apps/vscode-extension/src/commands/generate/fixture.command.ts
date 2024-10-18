
import type { ExtensionContext } from 'vscode';
import * as vscode from 'vscode';
import { getPackageScriptRunner, getSchematicDefaultOptions, stringifyOptions } from '../helpers';

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

        const defaultOptions = await getSchematicDefaultOptions('@o3r/testing:add-functions-to-fixture');
        const fixtureDoc = await vscode.workspace.openTextDocument(fixtureDocUri);
        const selectedClasses = textSelected.match(/class="([^"]+)"/)?.[1] || textSelected;
        const options = [
          ...stringifyOptions(defaultOptions),
          `--path ${relativePath}`,
          ...chosenMethods.map((m) => `--methods ${m}`),
          `--selector=".${selectedClasses.replace(/ /g, '.')}"`
        ];
        terminal.sendText(`${await getPackageScriptRunner()} ng generate @o3r/testing:add-functions-to-fixture ${options.join(' ')}`, true);
        terminal.show();
        await vscode.window.showTextDocument(fixtureDoc);
      } else {
        await vscode.window.showInformationMessage('No fixture type selected');
      }


    } else {
      await vscode.window.showInformationMessage(textSelected
        ? 'File is not a html template file'
        : 'No selected text'
      );
    }
  };
}
