import {chain, Rule, SchematicContext, Tree} from '@angular-devkit/schematics';
import * as ts from 'typescript';

/**
 * Rule to import all the necessary dependency to run an @ama-sdk based application
 * Helps to migrate from previous versions with an import replacement
 */
export function ngAdd(): Rule {

  const removeImports = async (_: Tree, context: SchematicContext) => {
    try {
      const {removePackages} = await import('@o3r/schematics');
      return removePackages(['@dapi/sdk-core']);
    } catch (e) {
      // o3r extractors needs o3r/core as peer dep. o3r/core will install o3r/schematics
      context.logger.error(`[ERROR]: Adding @ama-sdk/core has failed.
      If the error is related to missing @o3r dependencies you need to install '@o3r/schematics' to be able to use the @ama-sdk/core ng add. Please run 'ng add @o3r/schematics' .
      Otherwise, use the error message as guidance.`);
      throw (e);
    }
  };

  /* ng add rules */
  const updateImports = async (tree: Tree, context: SchematicContext) => {
    try {
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
    } catch (e) {
      // o3r extractors needs o3r/core as peer dep. o3r/core will install o3r/schematics
      context.logger.error(`[ERROR]: Adding @ama-sdk/core has failed.
      If the error is related to missing @o3r dependencies you need to install '@o3r/schematics' to be able to use the @ama-sdk/core ng add. Please run 'ng add @o3r/schematics' .
      Otherwise, use the error message as guidance.`);
      throw (e);
    }
  };
  return chain([
    removeImports,
    updateImports
  ]);
}
