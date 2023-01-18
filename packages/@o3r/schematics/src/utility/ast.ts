import * as ts from '@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript';
import { findNodes } from '@schematics/angular/utility/ast-utils';

/**
 * Find the first node with the specific syntax kind
 *
 * @param sourceFile Typescript file
 * @param searchKind Kind of syntax to look up
 * @param node current node
 */
export function findFirstNodeOfKind<T extends ts.Node = ts.Node>(sourceFile: ts.SourceFile, searchKind: ts.SyntaxKind, node?: ts.Node): T | null {
  const currentNode = node || sourceFile;
  let ret: T | null = null;
  currentNode.forEachChild((n) => {
    if (!ret) {
      if (n.kind === searchKind) {
        ret = n as T;
      } else {
        ret = findFirstNodeOfKind(sourceFile, searchKind, n);
      }
    }
  });
  return ret;
}

/**
 * Find the last node with the specific syntax kind
 *
 * @param sourceFile Typescript file
 * @param searchKind Kind of syntax to look up
 * @param node current node
 */
export function findLastNodeOfKind<T extends ts.Node = ts.Node>(sourceFile: ts.SourceFile, searchKind: ts.SyntaxKind, node?: ts.Node): T | null {
  const currentNode = node || sourceFile;
  let ret: T | null = null;
  currentNode.forEachChild((n) => {
    if (n.kind === searchKind) {
      ret = ret && ret.pos > n.pos ? ret : n as T;
    } else {
      const found = findLastNodeOfKind<T>(sourceFile, searchKind, n);
      if (found) {
        ret = !ret ? found : (found.pos > ret.pos ? found : ret);
      }
    }
  });
  return ret;
}

/**
 * Reads all the imports of a given SourceFile and returns a parsed list that's easy to consume.
 *
 * @param sourceFile
 */
export function parseImportsFromFile(sourceFile: ts.SourceFile) {
  // First we look for all imports lines targeting an Otter package for which we know a mapping
  return findNodes(sourceFile, ts.SyntaxKind.ImportDeclaration).map((nodeImp) => {
    const imp = nodeImp as ts.ImportDeclaration;
    const importFrom = imp.moduleSpecifier.getText().replace(/['"]/g, '');

    // We retrieve all the symbols listed in the import statement
    const namedImport = imp.importClause && imp.importClause.getChildAt(0);
    const imports = namedImport && ts.isNamedImports(namedImport) ?
      namedImport.elements.map((element) => element.getText()) :
      [];

    return {node: imp, symbols: imports, module: importFrom};
  });
}

/**
 * Given a program and a path to a source file, returns all the Symbols exported by the file.
 *
 * @param program
 * @param sourcePath
 */
export function getExportedSymbolsFromFile(program: ts.Program, sourcePath: string) {
  const typeChecker = program.getTypeChecker();
  const sourceFile = program.getSourceFiles().find((file) => {
    return file.fileName === sourcePath;
  });

  if (!sourceFile) {
    return [];
  }

  const symbol = typeChecker.getSymbolAtLocation(sourceFile);

  return typeChecker.getExportsOfModule(symbol!);
}
