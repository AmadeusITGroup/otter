import { Position, Selection, TextDocument, TextEditorEdit, TextLine, workspace } from 'vscode';
import { basename } from 'node:path';
import { EOL } from 'node:os';
import {regExp} from './regex.helper';
import * as vscode from 'vscode';

/**
 * Sanitize the selector
 *
 * @param selector to clean
 * @returns the cleaned selector
 */
function cleanSelector(selector: string): string {
  return selector.replaceAll(regExp.trimLeft, '')
    .replaceAll(regExp.trimRight, '')
    .replaceAll(regExp.sanitizer, '-');
}

/**
 * Generate the proposed variable name based of the path of selectors.
 * Also make sure to not include any duplicated selectors or any forbidden words from the config `forbiddenWords`
 *
 * @param selectors to used to generate the name
 * @param fileName name of the file to append to the generated name
 * @returns the final proposed name
 */
function generateScssVarName(selectors: string[], fileName: string): string {
  let name = '';
  const forbiddenWords = vscode.workspace.getConfiguration('otter.extract.styling').get<string>('forbiddenWords');
  const wordsNotToReuseSet = new Set<string>([...forbiddenWords ?? [], '']);
  const prefixToAdd = workspace.getConfiguration('otter.extract.styling').get<string>('prefix');

  selectors = [...([prefixToAdd ?? '']), fileName, ...selectors];
  selectors.forEach((element) => {
    const elementWords = element.split('-');
    let distinctSelector = '';
    elementWords.forEach((word) => {
      if (!wordsNotToReuseSet.has(word)) {
        wordsNotToReuseSet.add(word);
        distinctSelector = distinctSelector.concat(word, '-');
      }
    });
    name = name.concat(distinctSelector);
  });
  return name;
}

/**
 * Go through the tree of selectors and keep only the path to the selected property
 *
 * @param css String which contains all the css between the beginning of the document and the
 * last character of the selected line, so without close curly bracket of the class containing the property.
 * @param selectors List of all selectors found with a Regex in the css
 * @returns list of used selectors
 */
function keepOnlyUsedSelector(css: string, selectors: string[]): string[] {
  if (!css || !selectors) {
    return [];
  }
  let indexOfCurrentElement = 0;
  const copySelectors = [...selectors];
  copySelectors.forEach((element) => {
    let numberOfBracket = 0;
    const selectorIndexInCssString = css.indexOf(element);
    if (selectorIndexInCssString >= 0) {
      for (let i = selectorIndexInCssString; i < css.length; i++) {
        if (css.charAt(i) === '{') {
          numberOfBracket++;
        }
        if (css.charAt(i) === '}') {
          numberOfBracket--;
          if (numberOfBracket === 0) {
            // When it's equal to 0 it means that the selector doesn't apply to our property
            // so we have to remove it and the selectors it contains
            selectors.splice(indexOfCurrentElement, 1);
            indexOfCurrentElement--;
            // remove all the css contained in the selector not used so also the selectors contained in it
            const stringToRemove = css.substring(selectorIndexInCssString, i + 1);
            if (stringToRemove) {
              css = css.replace(stringToRemove, '');
            }
            break;
          }
        }
      }
    } else {
      selectors.splice(indexOfCurrentElement, 1);
      indexOfCurrentElement--;
    }
    // Allows you to advance through the list of selectors or to return to the location of
    // the selector removed in the previous cycle
    indexOfCurrentElement++;
  });
  return selectors;
}

/**
 * Determine if the given value is the value of the property of the targeted line
 *
 * @param value
 * @param line
 */
export function isPropertyValue(value: string, line: TextLine) {
  const sanitizedValue = value.replace(/\\*\(/g, '\\(').replace(/\\*\)/g, '\\)');
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
 * @param endPos
 */
export function generateVariableName(document: TextDocument, line: TextLine) {
  const documentNamePart = basename(document.fileName, '.scss').replace(/\.?(styling|style|theme)$/, '').replace('_','');
  const property = getProperty(line) || 'unknown-property';

  const startFilePos = new Position(0, 0);
  const newSelection = new Selection(startFilePos, line.range.end);
  const doc = document.getText(newSelection);
  const css = doc.match(regExp.css)?.shift();

  const allSelectors = css?.match(regExp.allSelectors);

  if (css && allSelectors) {
    const usedSelectors = keepOnlyUsedSelector(css, allSelectors);
    const cleanedSelectors = usedSelectors.map((selector) => cleanSelector(selector)) ?? [];
    const parsedName = generateScssVarName(cleanedSelectors, documentNamePart);
    return `${parsedName}${property}`;
  }
  return 'default-variable-name';
}

/**
 * Retrieve the line number where to insert the generated code
 *
 * @param document
 */
export function lineIndexToInsert(document: TextDocument): number {
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
    edit.insert(position, `@use '@o3r/styling' as ${alias};${EOL}${EOL}`);
  }
  edit.insert(position, `$${variableName}: ${alias}.variable('${variableName}', ${value});${EOL}`);
  return position;
}
