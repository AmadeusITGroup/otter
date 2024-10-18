import * as ts from 'typescript';
import { logging } from '@angular-devkit/core';
import { findNodes } from '@schematics/angular/utility/ast-utils';
import type { Tree } from '@angular-devkit/schematics';

/**
 * Extracted symbol from an import line.
 */
interface ExtractedImport {
  /** Element imported */
  symbol: string;

  /** Is import type */
  isTypeOnlyImport: boolean;

  /** Module from where the symbol is imported */
  location: string;
}

/** Map containing all import changes in otter packages */
export interface ImportsMapping {
  [packageName: string]: { [importName: string]: { newPackage: string; newValue?: string } };
}


/**
 * Update the imports of a given file according to replace mapping
 * @param logger Logger to report messages
 * @param tree File System tree
 * @param sourceFile Source file to analyze
 * @param importsRegexp Regexp of the imports to replace
 * @param renamePackagesRegexp Regexp of the packages to replace
 * @param mapImports Map of the import to replace
 * @param renamedPackages Map of the import package to replace
 */
export function updateImportsInFile(
  logger: logging.LoggerApi,
  tree: Tree,
  sourceFile: ts.SourceFile,
  importsRegexp: RegExp,
  renamePackagesRegexp: RegExp,
  mapImports: ImportsMapping = {},
  renamedPackages: Record<string, string> = {}
) {
  const oldImportedSymbolsPerPackage: Record<string, ExtractedImport[]> = {};
  const unResolvedImports: ExtractedImport[] = [];
  const importNodes: ts.ImportDeclaration[] = [];

  // First we look for all imports lines targeting an Otter package for which we know a mapping
  findNodes(sourceFile, ts.SyntaxKind.ImportDeclaration).map((nodeImp) => {
    const imp = nodeImp as ts.ImportDeclaration;
    const importFrom = imp.moduleSpecifier.getText().replace(/['"]/g, '');

    const renamePackageMatch = importFrom.match(renamePackagesRegexp);

    const otterPackage = renamePackageMatch?.[0] || importFrom.match(importsRegexp)?.[0];

    // If the import matched an Otter package
    if (otterPackage) {

      if (!oldImportedSymbolsPerPackage[otterPackage]) {
        oldImportedSymbolsPerPackage[otterPackage] = [];
      }

      // We store the import line to be able to remove it afterwards
      importNodes.push(imp);

      // We retrieve all the symbols listed in the import statement
      const namedImport = imp.importClause?.namedBindings;
      const isTypeOnlyImport = !!imp.importClause && ts.isTypeOnlyImportDeclaration(imp.importClause);
      const imports: ExtractedImport[] = namedImport && ts.isNamedImports(namedImport)
        ? namedImport.elements.map((element) =>
          ({symbol: element.getText(), isTypeOnlyImport, location: importFrom}))
        : [];

      // And associate them to the Otter package
      oldImportedSymbolsPerPackage[otterPackage].push(...imports);
    }
  });

  // If did not capture any interesting import line, do nothing
  if (importNodes.length === 0) {
    return 0;
  }

  // Iterate over the imports and look into the renamed packages and into the map to see the import new module
  // If no mapping is found, we keep the original import location
  const resolvedImports = Object.entries(oldImportedSymbolsPerPackage).reduce((acc, [oldPackageName, importsFromOldPackage]) => {
    importsFromOldPackage.forEach((importSymbol) => {

      let newPackageNameImport;
      newPackageNameImport = renamedPackages[oldPackageName] ? importSymbol.location.replace(oldPackageName, renamedPackages[oldPackageName]) : mapImports[oldPackageName]?.[importSymbol.symbol]?.newPackage;

      const importFrom = newPackageNameImport || importSymbol.location;
      if (!newPackageNameImport) {
        unResolvedImports.push(importSymbol);
      }
      if (!acc[importFrom]) {
        acc[importFrom] = [];
      }
      const newNameForExportedValue = mapImports[oldPackageName]?.[importSymbol.symbol]?.newValue;
      acc[importFrom].push(`${importSymbol.isTypeOnlyImport ? 'type ' : ''}${newNameForExportedValue || importSymbol.symbol}`);
    });
    return acc;
  }, {} as Record<string, string[]>);

  let fileContent = tree.readText(sourceFile.fileName);
  const escapeRegExp = (str: string) => str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');

  // Remove captured imports
  fileContent = fileContent.replace(new RegExp(`(${importNodes.map((node) => escapeRegExp(node.getText())).join('|')})[\\n\\r]*`, 'g'), '');

  // Replace imported values
  const valuesToReplace = Object.fromEntries(Object.values(mapImports).flatMap((mapImport) =>
    Object.entries(mapImport)
      .filter(([_, value]) => value.newValue)
      .map(([key, value]) => [key, value.newValue!])
  ));
  if (Object.keys(valuesToReplace).length > 0) {
    const matcher = new RegExp(Object.keys(valuesToReplace).map((oldValue) => `\\b${escapeRegExp(oldValue)}\\b`).join('|'), 'g');
    const replacer = (match: string) => valuesToReplace[match];
    fileContent = fileContent.replace(matcher, replacer);
  }

  // Add the computed imports at the top of the file
  fileContent = Object.entries(resolvedImports)
    .map(([importFrom, imports]) => `import {${imports.join(', ')}} from '${importFrom}';`)
    .join('\n') + '\n' + fileContent;

  tree.overwrite(sourceFile.fileName, fileContent);

  // Log details about imports for which we could not find an associated sub-entry
  if (unResolvedImports.length > 0) {
    logger.warn(`Some imports in file ${sourceFile.fileName} could not be resolved:`);
    unResolvedImports.forEach((unResolvedImport) => logger.warn(`  |-- symbol "${unResolvedImport.symbol}" from module "${unResolvedImport.location}"`));
  }

  return unResolvedImports.length;
}
