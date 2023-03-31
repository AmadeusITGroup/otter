import { Rule } from '@angular-devkit/schematics';
import * as ts from 'typescript';
import { getSourceFilesFromWorkspaceProjects, ImportsMapping, updateImportsInFile } from '../../utility';

export * from './v7-to-v8-map-object';

/**
 * Update imports based on mapping
 *
 * @param mapImports Map of the import to replace
 * @param renamedPackages Map of the import package to replace
 */
export function updateImports(mapImports: ImportsMapping = {}, renamedPackages: Record<string, string> = {}): Rule {

  return (tree, context) => {
    const files = getSourceFilesFromWorkspaceProjects(tree);

    // exact match on import path
    const importsRegexp = new RegExp(`^(${[...Object.keys(mapImports)].join('|')})$`);
    // match the import path starting with the package to be renamed
    const renamePackagesRegexp = new RegExp(`^(${[...Object.keys(renamedPackages)].join('|')})`);
    let nbOfUnResolvedImports = 0;

    files.forEach((file) => {
      const sourceFile = ts.createSourceFile(
        file,
        tree.read(file)!.toString(),
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
