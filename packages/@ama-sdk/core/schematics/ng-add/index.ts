import * as path from 'node:path';
import {
  chain,
  type Rule,
} from '@angular-devkit/schematics';
import {
  createOtterSchematic,
  getFilesInFolderFromWorkspaceProjectsInTree,
  ngAddDependenciesRule,
  removePackages,
} from '@o3r/schematics';
import * as ts from 'typescript';
import type {
  NgAddSchematicsSchema,
} from './schema';

const removeImports = removePackages(['@dapi/sdk-core']);

const updateImports: Rule = (tree) => {
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
      && !!/["']@dapi\/sdk-core["']/.test(node.moduleSpecifier.getText())
    );
    if (dapiSdkCodeImports.length > 0) {
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

const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');

/**
 * Rule to import all the necessary dependency to run an @ama-sdk based application
 * Helps to migrate from previous versions with an import replacement
 * @param options schema options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  return chain([
    removeImports,
    updateImports,
    ngAddDependenciesRule(options, packageJsonPath, { dependenciesToInstall: [], devDependenciesToInstall: [] })
  ]);
}

/**
 * Rule to import all the necessary dependency to run an @ama-sdk based application
 * Helps to migrate from previous versions with an import replacement
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema) => createOtterSchematic(ngAddFn)(options);
