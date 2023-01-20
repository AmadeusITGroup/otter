/* eslint-disable no-console */
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getSourceFilesFromWorkspaceProjects } from '@o3r/schematics';
import * as ts from 'typescript';
import { mapImportV7toV8, renamedPackages } from './v7-to-v8-map-object';
import { logging } from '@angular-devkit/core';
import { findNodes } from '@schematics/angular/utility/ast-utils';

/**
 * Extracted symbol from an import line.
 */
interface ExtractedImport {
  /** Element imported */
  symbol: string;

  /** Module from where the symbol is imported */
  location: string;
}


function updateImportsInFile(
  logger: logging.LoggerApi,
  tree: Tree,
  sourceFile: ts.SourceFile,
  importsRegexp: RegExp,
  renamePackagesRegexp: RegExp) {
  const oldImportedSymbolsPerPackage: Record<string, ExtractedImport[]> = {};
  const unResolvedImports: ExtractedImport[] = [];
  const importNodes: ts.ImportDeclaration[] = [];

  // First we look for all imports lines targeting an Otter package for which we know a mapping
  findNodes(sourceFile, ts.SyntaxKind.ImportDeclaration).map((nodeImp) => {
    const imp = nodeImp as ts.ImportDeclaration;
    const importFrom = imp.moduleSpecifier.getText().replace(/['"]/g, '');

    const renamePackageMatch = importFrom.match(renamePackagesRegexp);

    const otterPackage = renamePackageMatch ? renamePackageMatch[0] : importFrom.match(importsRegexp)?.[0];

    // If the import matched an Otter package
    if (otterPackage) {

      if (!oldImportedSymbolsPerPackage[otterPackage]) {
        oldImportedSymbolsPerPackage[otterPackage] = [];
      }

      // We store the import line to be able to remove it afterwards
      importNodes.push(imp);

      // We retrieve all the symbols listed in the import statement
      const namedImport = imp.importClause && imp.importClause.getChildAt(0);
      const imports: ExtractedImport[] = namedImport && ts.isNamedImports(namedImport) ?
        namedImport.elements.map((element) => ({symbol: element.getText(), location: importFrom})) :
        [];

      // And associate them to the Otter package
      oldImportedSymbolsPerPackage[otterPackage].push(...imports);
    }
  });

  // If did not capture any interesting import line, do nothing
  if (importNodes.length === 0) {
    return 0;
  }

  // Iterate on the imports we found and lookup into the renamed packages or into the map to see from where the import should be taken
  // If no mapping is found, we keep the original import location
  const resolvedImports = Object.entries(oldImportedSymbolsPerPackage).reduce((acc, [oldPackageName, importsFromOldPackage]) => {
    importsFromOldPackage.forEach((importSymbol) => {

      let newPackageNameImport;
      if (Object.keys(renamedPackages).indexOf(oldPackageName) > 0) {
        newPackageNameImport = importSymbol.location.replace(oldPackageName, renamedPackages[oldPackageName]);
      } else {
        newPackageNameImport = mapImportV7toV8[oldPackageName]?.[importSymbol.symbol]?.newPackage;
      }

      const importFrom = newPackageNameImport || importSymbol.location;
      if (!newPackageNameImport) {
        unResolvedImports.push(importSymbol);
      }
      if (!acc[importFrom]) {
        acc[importFrom] = [];
      }
      const newNameForExportedValue = mapImportV7toV8[oldPackageName]?.[importSymbol.symbol]?.newValue;
      acc[importFrom].push(newNameForExportedValue || importSymbol.symbol);
    });
    return acc;
  }, {} as Record<string, string[]>);

  // Remove captured imports
  const fileWithoutImports = tree.read(sourceFile.fileName)!.toString()
    .replace(new RegExp(`(${importNodes.map((node) => node.getText()).join('|')})[\\n\\r]*`, 'g'), '');
  // Add the computed imports at the top of the file
  const fileWithNewImports = Object.entries(resolvedImports)
    .map(([importFrom, imports]) => `import {${imports.join(', ')}} from '${importFrom}';`)
    .join('\n') + '\n' + fileWithoutImports;
  tree.overwrite(sourceFile.fileName, fileWithNewImports);

  // Log details about imports for which we could not find an associated sub-entry
  if (unResolvedImports.length > 0) {
    logger.warn(`[update-imports-v7-to-v8] Some imports in file ${sourceFile.fileName} could not be resolved:`);
    unResolvedImports.forEach((unResolvedImport) => logger.warn(`  |-- symbol "${unResolvedImport.symbol}" from module "${unResolvedImport.location}"`));
  }

  return unResolvedImports.length;
}


/**
 * Update imports from v7 to v8
 *
 */
export function updateImports(): Rule {

  return (tree: Tree, context: SchematicContext) => {
    const files = getSourceFilesFromWorkspaceProjects(tree);

    // exact match on import path
    const importsRegexp = new RegExp(`^(${[...Object.keys(mapImportV7toV8)].join('|')})$`);
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
      nbOfUnResolvedImports += updateImportsInFile(context.logger, tree, sourceFile, importsRegexp, renamePackagesRegexp);
    });

    if (nbOfUnResolvedImports > 0) {
      context.logger.warn(`[update-imports-v7-to-v8] The migration rule could not resolve a total of ${nbOfUnResolvedImports} imports that you may have to migrate manually (see the details above).`);
    }

    return tree;
  };
}
