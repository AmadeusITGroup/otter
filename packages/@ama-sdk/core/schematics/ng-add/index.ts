import { chain, Rule, Tree } from '@angular-devkit/schematics';
import * as ts from 'typescript';

/**
 * Rule to import all the necessary dependency to run an @ama-sdk based application
 * Helps to migrate from previous versions with an import replacement
 */
export function ngAdd(): Rule {

  const removeImports = async () => {
    const {removePackages} = await import('@o3r/schematics');
    return removePackages(['@dapi/sdk-core']);
  };

  /* ng add rules */
  const updateImports = async (tree: Tree) => {
    const {getFilesInFolderFromWorkspaceProjectsInTree} = await import('@o3r/schematics');
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
      return tree;
    });
  };
  return chain([
    removeImports,
    updateImports
  ]);
}
