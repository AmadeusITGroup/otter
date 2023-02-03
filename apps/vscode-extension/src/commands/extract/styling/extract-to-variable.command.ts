import { EOL } from 'node:os';
import { ExtensionContext, Range, TextEditor, window } from 'vscode';
import { generateVariableName, insertVariable, isPropertyValue } from './helpers';

/**
 * Extract a single prop/value scss line to an otter variable
 * The active cursor needs to be on the line you want to refactor
 *
 * @param _context
 */
export function extractToVariable(_context: ExtensionContext) {
  return async (editor: TextEditor) => {
    const document = editor.document;
    const selection = editor.selection.active;
    const selectionRange = new Range(editor.selection.start, editor.selection.end);
    const line = document.lineAt(selection.line);
    const valueRange = selectionRange.isSingleLine && !selectionRange.isEmpty ? selectionRange : document.getWordRangeAtPosition(selection);
    if (!valueRange) {
      return window.showInformationMessage('The selection is invalid');
    }

    const value = document.getText(valueRange);
    if (!isPropertyValue(value, line)) {
      return window.showInformationMessage(`The selected word '${value}' is not a CSS property`);
    }

    const variableName = await window.showInputBox({
      prompt: 'Do you want to change the variable name?',
      value: generateVariableName(document, line)
    });
    if (!variableName) {
      return;
    }

    const hasEdited = await editor.edit((edit) => {
      edit.replace(valueRange, `$${variableName}`);
      const pos = insertVariable(document, edit, variableName, value);
      if (!document.lineAt(pos.line + 1).text.startsWith('$')) {
        edit.insert(pos, EOL);
      }
    });

    if (!hasEdited) {
      return window.showInformationMessage(`The edition of ${document.fileName} has failed`);
    }
  };
}
