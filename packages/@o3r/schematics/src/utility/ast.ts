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

/**
 * Decorator with arguments
 *
 * @example `@Decorator({ propName: 'value' })`
 */
export type DecoratorWithArg = ts.Decorator & {
  expression: ts.CallExpression & {
    expression: ts.Identifier;
  };
};

/**
 * Returns true if it is a decorator with arguments
 *
 * @param node decorator node
 */
export const isDecoratorWithArg = (node: ts.Node): node is DecoratorWithArg =>
  ts.isDecorator(node)
  && ts.isCallExpression(node.expression)
  && ts.isIdentifier(node.expression.expression);

/**
 * Returns the value of {@link argName} in the first argument
 *
 * @param decorator
 * @param argName
 */
export const getPropertyFromDecoratorFirstArgument = (decorator: DecoratorWithArg, argName: string) => {
  const ngClassDecoratorArgument = decorator.expression.arguments[0];

  if (ts.isObjectLiteralExpression(ngClassDecoratorArgument)) {
    return ngClassDecoratorArgument.properties.find((prop): prop is ts.PropertyAssignment =>
      ts.isPropertyAssignment(prop)
      && ts.isIdentifier(prop.name)
      && prop.name.escapedText.toString() === argName
    )?.initializer;
  }
};

/**
 * Returns `ExpressionWithTypeArguments[]` of a class that implements {@link str}
 *
 * @param str
 */
export const generateImplementsExpressionWithTypeArguments = (str: string) => {
  const sourceFile = ts.createSourceFile(
    'index.ts',
    `class A implements ${str} {}`,
    ts.ScriptTarget.ES2020,
    true
  );
  return [...(sourceFile.statements[0] as ts.ClassDeclaration).heritageClauses![0].types];
};

/**
 * Returns `ClassElement[]` of a class that have {@link str} has body
 *
 * @param str
 */
export const generateClassElementsFromString = (str: string) => {
  const sourceFile = ts.createSourceFile(
    'index.ts',
    `class A {
      ${str}
    }`,
    ts.ScriptTarget.ES2020,
    true
  );

  return [...(sourceFile.statements[0] as ts.ClassDeclaration).members];
};

/**
 * Returns `Statement[]` of a function that have {@link str} has body
 *
 * @param str
 */
export const generateBlockStatementsFromString = (str: string) => {
  const sourceFile = ts.createSourceFile(
    'index.ts',
    `function func() {
      ${str}
    }`,
    ts.ScriptTarget.ES2020,
    true
  );
  return [...(sourceFile.statements[0] as ts.FunctionDeclaration).body!.statements];
};

/**
 * Returns `ParameterDeclaration[]` of a function that have {@link str} has parameters
 *
 * @param str
 */
export const generateParametersDeclarationFromString = (str: string) => {
  const sourceFile = ts.createSourceFile(
    'index.ts',
    `function func(${str}) {}`,
    ts.ScriptTarget.ES2020,
    true
  );
  return [...(sourceFile.statements[0] as ts.FunctionDeclaration).parameters];
};

/**
 * Method to sort ClassElement based on the kind of it
 * order will be PropertyDeclaration, Constructor then MethodDeclaration
 *
 * @param classElement1
 * @param classElement2
 */
export const sortClassElement = (classElement1: ts.ClassElement, classElement2: ts.ClassElement) => {
  switch (classElement1.kind) {
    case ts.SyntaxKind.PropertyDeclaration: {
      return -1;
    }
    case ts.SyntaxKind.Constructor: {
      switch (classElement2.kind) {
        case ts.SyntaxKind.PropertyDeclaration: {
          return 1;
        }
        case ts.SyntaxKind.MethodDeclaration: {
          return -1;
        }
        default: {
          return -1;
        }
      }
    }
    case ts.SyntaxKind.MethodDeclaration: {
      return 1;
    }
    default: {
      return 1;
    }
  }
};
