import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getSourceFilesFromWorkspaceProjects, parseImportsFromFile } from '@o3r/schematics';
import * as ts from 'typescript';

const STORE_PACKAGE_REGEXP = /^@otter\/store/;

type ActionReplacer = (toReplace: string) => string;

/**
 * For the given SourceFile, looks if any known action is imported from @otter/store, and migrate its import and usage to
 * the v4 factories.
 *
 * @param tree
 * @param sourceFile
 * @param actionsMapping
 */
export function updateStoreActionsInFile(tree: Tree, sourceFile: ts.SourceFile, actionsMapping: Record<string, ActionReplacer>) {
  // Get all import symbols corresponding to known actions from Otter v3
  const imports = parseImportsFromFile(sourceFile)
    .filter((importItem) => STORE_PACKAGE_REGEXP.test(importItem.module))
    .reduce((acc, importItem) => {
      return acc.concat(importItem.symbols.filter((symbol) => actionsMapping[symbol]));
    }, [] as string[]);

  if (imports.length === 0) {
    return;
  }

  let fileContent = tree.read(sourceFile.fileName)!.toString();

  // For each detected action, apply its replacer to the whole file
  imports.forEach((symbol) => {
    fileContent = actionsMapping[symbol](fileContent);
  });

  tree.overwrite(sourceFile.fileName, fileContent);
}

/**
 * Migration factory to detect and update store actions imports and usage from v3 to v4
 *
 * @param _options
 * @param _options.projectName
 */
export function updateStoreActions(_options?: { projectName?: string | null | undefined }): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const files = getSourceFilesFromWorkspaceProjects(tree);

    const storeActionsMapping = require('./exported-actions-v3.json') as Record<string, string>;
    // Build a map that associates to every Otter v3 action name a replacer to be applied to the file where it's found
    const currentActionToRegExp = Object.entries(storeActionsMapping).reduce((acc, [oldName, newName]) => {
      const regexp = new RegExp(`(new\\s+|\\b)${oldName}\\b`, 'g');
      acc[oldName] = (toReplace: string) => toReplace.replace(regexp, newName);
      return acc;
    }, {} as Record<string, ActionReplacer>);

    files.forEach((file) => {
      const sourceFile = ts.createSourceFile(
        file,
        tree.read(file)!.toString(),
        ts.ScriptTarget.ES2015,
        true
      );
      updateStoreActionsInFile(tree, sourceFile, currentActionToRegExp);
    });

    return tree;
  };
}
