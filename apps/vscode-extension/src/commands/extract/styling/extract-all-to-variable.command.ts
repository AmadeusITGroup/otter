import { EOL } from 'node:os';
import { ExtensionContext, Position, Range, TextEditor, window } from 'vscode';
import { generateVariableName, insertVariable, isPropertyValue } from './helpers/utils.helper';

/**
 * Replace all the interested lines with an Otter variable
 * @param _context
 */
export function extractAllToVariable(_context: ExtensionContext) {
  return async (editor: TextEditor) => {
    const isPropertyLineRegExp = /^ *[^ .$#:]+ *: *([^$:]+) *;/;
    const document = editor.document;
    const lines: { valueRange: Range; variableName: string; value: string }[] = [];
    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      const match = line.text.match(isPropertyLineRegExp);
      if (!match) {
        continue;
      }
      const valueRange = new Range(
        new Position(line.lineNumber, line.text.indexOf(match[1])),
        new Position(line.lineNumber, line.text.indexOf(match[1]) + match[1].length)
      );
      if (!valueRange) {
        continue;
      }

      const value = document.getText(valueRange);
      if (!isPropertyValue(value, line)) {
        continue;
      }

      const variableName = generateVariableName(document, line);

      lines.push({
        valueRange,
        variableName,
        value
      });
    }


    const hasEdited = await editor.edit((edit) => {
      let pos: Position | undefined;
      lines.forEach(({valueRange, variableName, value}, idx) => {
        edit.replace(valueRange, `$${variableName}`);
        pos = insertVariable(document, edit, variableName, value, !!idx, pos);
      });
      if (pos && !document.lineAt(pos.line + 1).text.startsWith('$')) {
        edit.insert(pos, EOL);
      }
    });

    if (!hasEdited) {
      await window.showInformationMessage(`The edition of ${document.fileName} has failed`);
    }
  };
}
