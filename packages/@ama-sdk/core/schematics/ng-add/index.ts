import {chain, type Rule} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import * as ts from 'typescript';
import * as path from 'node:path';

/**
 * Rule to import all the necessary dependency to run an @ama-sdk based application
 * Helps to migrate from previous versions with an import replacement
 */
export function ngAdd(): Rule {

  const checkSchematicsDependency: Rule = async (_, context) => {
    try {
      await import('@o3r/schematics');
    } catch (e) {
      // o3r extractors needs o3r/core as peer dep. o3r/core will install o3r/schematics
      context.logger.error(`[ERROR]: Adding @ama-sdk/core has failed.
      If the error is related to missing @o3r dependencies you need to install '@o3r/schematics' to be able to use the @ama-sdk/core ng add. Please run 'ng add @o3r/schematics' .
      Otherwise, use the error message as guidance.`);
      throw (e);
    }
  };

  const removeImports: Rule = async () => {
    const {removePackages} = await import('@o3r/schematics');
    return removePackages(['@dapi/sdk-core']);
  };

  /* ng add rules */
  const updateImports: Rule = async (tree) => {
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


  const addMandatoryPeerDeps: Rule = async (_, context) => {
    const { getPeerDepWithPattern } = await import('@o3r/schematics');

    const peerDepToInstall = getPeerDepWithPattern(path.resolve(__dirname, '..', '..', 'package.json'), [
      'chokidar',
      'cpy',
      'minimist'
    ]);
    context.addTask(new NodePackageInstallTask({
      packageName: Object.entries(peerDepToInstall.matchingPackagesVersions)
        // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
        .map(([dependency, version]) => `${dependency}@${version || 'latest'}`)
        .join(' '),
      hideOutput: false,
      quiet: false
    }));
  };

  return chain([
    checkSchematicsDependency,
    removeImports,
    updateImports,
    addMandatoryPeerDeps
  ]);
}
