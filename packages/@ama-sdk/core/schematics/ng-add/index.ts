import { chain, type Rule } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import * as path from 'node:path';
import * as ts from 'typescript';
import type { NgAddSchematicsSchema } from './schema';
import {
  createSchematicWithMetricsIfInstalled,
  getFilesInFolderFromWorkspaceProjectsInTree,
  getPeerDepWithPattern,
  getWorkspaceConfig,
  removePackages
} from '@o3r/schematics';

/**
 * Rule to import all the necessary dependency to run an @ama-sdk based application
 * Helps to migrate from previous versions with an import replacement
 * @param options schema options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {

  const removeImports: Rule = async () => {
    return removePackages(['@dapi/sdk-core']);
  };

  /* ng add rules */
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


  const addMandatoryPeerDeps: Rule = (tree, context) => {
    const workingDirectory = options?.projectName && getWorkspaceConfig(tree)?.projects[options.projectName]?.root || '.';
    const peerDepToInstall = getPeerDepWithPattern(path.resolve(__dirname, '..', '..', 'package.json'));
    context.addTask(new NodePackageInstallTask({
      workingDirectory,
      packageName: Object.entries(peerDepToInstall.matchingPackagesVersions)
        // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
        .map(([dependency, version]) => `${dependency}@${version || 'latest'}`)
        .join(' '),
      hideOutput: false,
      quiet: false
    }));
  };

  return chain([
    removeImports,
    updateImports,
    addMandatoryPeerDeps
  ]);
}

/**
 * Rule to import all the necessary dependency to run an @ama-sdk based application
 * Helps to migrate from previous versions with an import replacement
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema): Rule => createSchematicWithMetricsIfInstalled(ngAddFn)(options);
