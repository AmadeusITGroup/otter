/* eslint-disable no-console */
import { logging } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getSourceFilesFromWorkspaceProjects } from '@o3r/schematics';
import * as ts from '@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript';
import { findNodes } from '@schematics/angular/utility/ast-utils';

/**
 * Represents the sub-entries mapping per package as stored in the file
 */
interface StoredMapping {
  [packageName: string] : {[subEntryName: string]: string[]};
}

/**
 * Represents the reversed sub-entries mapping that will be consumed by the rule
 */
interface ReversedMapping {
  [packageName: string] : {[importSymbol: string]: string};
}

/**
 * Extracted symbol from an import line.
 */
interface ExtractedImport {
  /** Element imported */
  symbol: string;

  /** Module from where the symbol is imported */
  location: string;
}

/**
 * Migrates imports in the given file in order to target their associated sub-entry following the provided subEntriesMapping
 *
 * @param logger
 * @param tree
 * @param sourceFile
 * @param subEntriesMapping
 * @param importsRegexp
 */
function updateSubEntriesImportsInFile(logger: logging.LoggerApi, tree: Tree, sourceFile: ts.SourceFile, subEntriesMapping: ReversedMapping, importsRegexp: RegExp) {
  const importedSymbolsPerPackage: Record<string, ExtractedImport[]> = {};
  const unResolvedImports: ExtractedImport[] = [];
  const importNodes: ts.ImportDeclaration[] = [];

  // First we look for all imports lines targeting an Otter package for which we know a mapping
  findNodes(sourceFile, ts.SyntaxKind.ImportDeclaration).map((nodeImp) => {
    const imp = nodeImp as ts.ImportDeclaration;
    const importFrom = imp.moduleSpecifier.getText().replace(/['"]/g, '');
    const importMatch = importFrom.match(importsRegexp);

    // If the import matched an Otter package
    if (importMatch) {
      const otterPackage = importMatch[1];

      if (!importedSymbolsPerPackage[otterPackage]) {
        importedSymbolsPerPackage[otterPackage] = [];
      }

      // We store the import line to be able to remove it afterwards
      importNodes.push(imp);

      // We retrieve all the symbols listed in the import statement
      const namedImport = imp.importClause && imp.importClause.getChildAt(0);
      const imports: ExtractedImport[] = namedImport && ts.isNamedImports(namedImport) ?
        namedImport.elements.map((element) => ({symbol: element.getText(), location: importFrom})) :
        [];

      // And associate them to the Otter package
      importedSymbolsPerPackage[otterPackage].push(...imports);
    }
  });

  // If did not capture any interesting import line, do nothing
  if (importNodes.length === 0) {
    return 0;
  }

  // Iterate on the imports we found and lookup in the mapping for the related sub-entry that we have to import it from
  // If no mapping is found, we keep the original import location
  const resolvedImports = Object.entries(importedSymbolsPerPackage).reduce((acc, [packageName, imports]) => {
    imports.forEach((importSymbol) => {
      const subEntry = subEntriesMapping[packageName][importSymbol.symbol];
      const importFrom = subEntry ? `@otter/${packageName}${subEntry ? '/' + subEntry : ''}` : importSymbol.location;
      if (!subEntry) {
        unResolvedImports.push(importSymbol);
      }
      if (!acc[importFrom]) {
        acc[importFrom] = [];
      }
      acc[importFrom].push(importSymbol.symbol);
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
    logger.warn(`[update-sub-entries] Some imports in file ${sourceFile.fileName} could not be resolved:`);
    unResolvedImports.forEach((unResolvedImport) => logger.warn(`  |-- symbol "${unResolvedImport.symbol}" from module "${unResolvedImport.location}"`));
  }

  return unResolvedImports.length;
}

/**
 * Update configuration to set differential loading for applications
 *
 * @param _options @see RuleFactory.options
 * @param _options.projectName Project name
 */
export function updateSubEntryImports(_options?: { projectName: string | null | undefined }): Rule {

  return (tree: Tree, context: SchematicContext) => {
    const files = getSourceFilesFromWorkspaceProjects(tree);

    const storedMapping = require('./mapping-from-v3.json') as StoredMapping;

    const importsRegexp = new RegExp(`^@otter/(${Object.keys(storedMapping).join('|')})`);

    const reversedMapping = Object.entries(storedMapping).reduce((acc, [packageName, packageMapping]) => {
      acc[packageName] = Object.entries(packageMapping).reduce((innerAcc, [subEntry, imports]) => {
        imports.forEach((importSymbol) => {
          if (innerAcc[importSymbol]) {
            console.error(`Found duplicate mapping for ${importSymbol}: ${innerAcc[importSymbol]} and ${subEntry}`);
          }
          innerAcc[importSymbol] = subEntry;
        });
        return innerAcc;
      }, {} as Record<string, string>);
      return acc;
    }, {} as ReversedMapping);

    let numberOfUnResolvedImports = 0;

    files.forEach((file) => {
      const sourceFile = ts.createSourceFile(
        file,
        tree.read(file)!.toString(),
        ts.ScriptTarget.ES2015,
        true
      );
      numberOfUnResolvedImports += updateSubEntriesImportsInFile(context.logger, tree, sourceFile, reversedMapping, importsRegexp);
    });

    if (numberOfUnResolvedImports > 0) {
      context.logger.warn(`[update-sub-entries] The migration rule could not resolve a total of ${numberOfUnResolvedImports} imports that you may have to migrate manually (see the details above).`);
    }

    return tree;
  };
}
