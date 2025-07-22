import type {
  Rule,
} from '@angular-devkit/schematics';
import {
  insertImport,
} from '@schematics/angular/utility/ast-utils';
import {
  applyToUpdateRecorder,
} from '@schematics/angular/utility/change';
import * as ts from 'typescript';

/**
 * Rule to add imports to a file
 * @param filePath
 * @param imports
 */
export const addImportsRule = (
  filePath: string,
  imports: {
    from: string;
    importNames: string[];
  }[]
): Rule => (tree, context) => {
  if (!tree.exists(filePath)) {
    context.logger.warn(`No update applied on file because ${filePath} does not exist.`);
    return;
  }
  imports.forEach(({ importNames, from }) => {
    importNames.forEach((importName) => {
      const sourceFile = ts.createSourceFile(
        filePath,
        tree.readText(filePath),
        ts.ScriptTarget.ES2020,
        true
      );
      const recorder = tree.beginUpdate(filePath);
      const change = insertImport(sourceFile, filePath, importName, from);
      applyToUpdateRecorder(recorder, [change]);
      tree.commitUpdate(recorder);
    });
  });
  return tree;
};
