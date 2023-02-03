import { Position, TextDocument, TextEditorEdit, TextLine, workspace } from 'vscode';
import { basename } from 'node:path';
import { EOL } from 'node:os';

/**
 * Determine if the given value is the value of the property of the targeted line
 *
 * @param value
 * @param line
 */
export function isPropertyValue(value: string, line: TextLine) {
  const sanitizedValue = value.replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  return (new RegExp(`:.*${sanitizedValue}.*;$`)).test(line.text);
}

/**
 * Get the property name of a line
 *
 * @param line
 */
export function getProperty(line: TextLine) {
  return /^ *([^ ]+) *:/.exec(line.text)?.[1] || undefined;
}

/**
 * Retrieve the name of parent CSS rule
 *
 * @param document
 * @param line
 */
export function getClassRuleName(document: TextDocument, line: TextLine) {
  let i = line.lineNumber;
  const ruleClassRegExp = /([^ ,#{.]+) *{$/;
  while (i >= 0) {
    const match = document.lineAt(i).text.match(ruleClassRegExp);
    if (match) {
      return match[1];
    }
    i--;
  }
}

/**
 * Generate the name of the variable based on filename, block rule and property name
 *
 * @param document
 * @param line
 */
export function generateVariableName(document: TextDocument, line: TextLine) {
  const documentNamePart = basename(document.fileName, '.scss').replace(/\.?(styling|style|theme)$/, '');
  const className = getClassRuleName(document, line) || 'unknown-class';
  const property = getProperty(line) || 'unknown-property';
  const prefix = workspace.getConfiguration('otter.extract.styling').get<string>('functionImportPath');
  return `${prefix ? `${prefix}-` : ''}${documentNamePart}-${className}-${property}`;
}

/**
 * Retrieve the line number where to insert the generated code
 *
 * @param document
 */
export function lineIndexToInsert(document: TextDocument) {
  let i = 0;
  while (i < document.lineCount) {
    const line = document.lineAt(i);
    if (!line.text.match(/^ *[@/]/)) {
      return i;
    }
    i++;
  }
  return 0;
}

/**
 * Insert the varibale definition, and the library import if needed, into the given document
 *
 * @param document
 * @param edit
 * @param variableName
 * @param value
 * @param noImport
 * @param previousPosition
 */
export function insertVariable(document: TextDocument, edit: TextEditorEdit, variableName: string, value: string, noImport = false, previousPosition?: Position) {
  const cssFileContent = document.getText();
  const matches = cssFileContent.match(new RegExp('^@use [\'"]@o3r/styling[\'"] as (.+);', 'm'));
  const needToInsertImport = !matches;
  const alias = matches?.[1] || 'o3r';
  const position = previousPosition || document.lineAt(lineIndexToInsert(document)).range.start;

  if (needToInsertImport && !noImport) {
    edit.insert(position, `@use '@o3r/styling' as ${alias};${EOL}`);
  }
  edit.insert(position, `$${variableName}: ${alias}.variable('${variableName}', ${value});${EOL}`);
  return position;
}
