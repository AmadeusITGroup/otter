import { chain, type Rule } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import * as path from 'node:path';
import * as ts from 'typescript';
import type { NgAddSchematicsSchema } from './schema';

const reportMissingSchematicsDep = (logger: { error: (message: string) => any }) => (reason: any) => {
  logger.error(`[ERROR]: Adding @ama-sdk/core has failed.
      If the error is related to missing @o3r dependencies you need to install '@o3r/schematics' to be able to use the @ama-sdk/core ng add. Please run 'ng add @o3r/schematics' .
      Otherwise, use the error message as guidance.`);
  throw reason;
};

/**
 * Rule to import all the necessary dependency to run an @ama-sdk based application
 * Helps to migrate from previous versions with an import replacement
 * @param options schema options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {

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
        && !!/['"]@dapi\/sdk-core['"]/.test(node.moduleSpecifier.getText())
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


  const addMandatoryPeerDeps: Rule = async (tree, context) => {
    const { getPeerDepWithPattern, getWorkspaceConfig } = await import('@o3r/schematics');
    const workingDirectory = options?.projectName && getWorkspaceConfig(tree)?.projects[options.projectName]?.root || '.';
    const peerDepToInstall = getPeerDepWithPattern(path.resolve(__dirname, '..', '..', 'package.json'));
    context.addTask(new NodePackageInstallTask({
      workingDirectory,
      packageName: Object.entries(peerDepToInstall.matchingPackagesVersions)

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
export const ngAdd = (options: NgAddSchematicsSchema): Rule => async (_, context) => {
  const { createSchematicWithMetricsIfInstalled } = await import('@o3r/schematics').catch(reportMissingSchematicsDep(context.logger));
  return createSchematicWithMetricsIfInstalled(ngAddFn)(options);
};
