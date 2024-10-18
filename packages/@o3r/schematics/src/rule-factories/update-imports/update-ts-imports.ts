import {
  Rule
} from '@angular-devkit/schematics';
import * as ts from 'typescript';
import {
  getFilesWithExtensionFromTree,
  getSourceFilesFromWorkspaceProjects,
  ImportsMapping,
  updateImportsInFile
} from '../../utility/index';

/**
 * Update imports based on mapping
 * @param mapImports Map of the import to replace
 * @param renamedPackages Map of the import package to replace
 * @param fromRoot Perform on all files in project
 */
export function updateImports(mapImports: ImportsMapping = {}, renamedPackages: Record<string, string> = {}, fromRoot = false): Rule {
  return (tree, context) => {
    const files = fromRoot ? getFilesWithExtensionFromTree(tree, 'ts') : getSourceFilesFromWorkspaceProjects(tree);

    // exact match on import path
    const escapeRegExp = (str: string) => str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
    const importsRegexp = new RegExp(`^(${Object.keys(mapImports).map(escapeRegExp).join('|')})$`);
    // match the import path starting with the package to be renamed
    const renamePackagesRegexp = new RegExp(`^(${Object.keys(renamedPackages).map(escapeRegExp).join('|')})`);
    let nbOfUnResolvedImports = 0;

    files.forEach((file) => {
      const sourceFile = ts.createSourceFile(
        file,
        tree.readText(file),
        ts.ScriptTarget.ES2015,
        true
      );
      nbOfUnResolvedImports += updateImportsInFile(context.logger, tree, sourceFile, importsRegexp, renamePackagesRegexp, mapImports, renamedPackages);
    });

    if (nbOfUnResolvedImports > 0) {
      context.logger.warn(`The migration rule could not resolve a total of ${nbOfUnResolvedImports} imports that you may have to migrate manually (see the details above).`);
    }

    return tree;
  };
}
