import { chain, Rule, Tree } from '@angular-devkit/schematics';
import { getFilesInFolderFromWorkspaceProjectsInTree, removePackages } from '@o3r/schematics';
import * as ts from 'typescript';

/**
 * Add Otter ama-sdk-core to an Angular Project
 *
 * @param options
 */
export function ngAdd(): Rule {
  /* ng add rules */
  const updateImports = (tree: Tree) => {
    const files = getFilesInFolderFromWorkspaceProjectsInTree(tree, '', 'ts');
    files.forEach((file) => {
      const sourceFile = ts.createSourceFile(
        file,
        tree.readText(file),
        ts.ScriptTarget.ES2015,
        true
      );
      const dapiSdkCodeImports = sourceFile.statements.filter((node): node is ts.ImportDeclaration =>
        ts.isImportDeclaration(node)
        && !!node.moduleSpecifier.getText().match(/['"]@dapi\/sdk-core['"]/)
      );
      if (dapiSdkCodeImports.length) {
        const recorder = tree.beginUpdate(file);
        dapiSdkCodeImports.forEach((imp) => {
          recorder.remove(imp.moduleSpecifier.getStart(), imp.moduleSpecifier.getWidth());
          recorder.insertRight(imp.moduleSpecifier.getStart(), '\'@ama-sdk/core\'');
        });
        tree.commitUpdate(recorder);
      }
    });
  };
  return chain([
    removePackages(['@dapi/sdk-core']),
    updateImports
  ]);

}
