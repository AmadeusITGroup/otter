import * as ts from 'typescript';
import { findNodes } from '@schematics/angular/utility/ast-utils';

/**
 * Find the first node with the specific syntax kind
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
 * @example
 * ```typescript
 * \@Decorator({ propName: 'value' })
 * ```
 */
export type DecoratorWithArg = ts.Decorator & {
  expression: ts.CallExpression & {
    expression: ts.Identifier;
  };
};

/**
 * Returns true if it is a decorator with arguments
 * @param node decorator node
 */
export const isDecoratorWithArg = (node: ts.Node): node is DecoratorWithArg =>
  ts.isDecorator(node)
  && ts.isCallExpression(node.expression)
  && ts.isIdentifier(node.expression.expression);

/**
 * Returns the value of {@link argName} in the first argument
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
 * @param str
 */
export const generateBlockStatementsFromString = (str: string) => {
  const sourceFile = ts.createSourceFile(
    'index.ts',
    `function func() {
      ${str.replace(/^\s*/g, '')}
    }`,
    ts.ScriptTarget.ES2020,
    true
  );
  return [...(sourceFile.statements[0] as ts.FunctionDeclaration).body!.statements];
};

/**
 * Returns `ParameterDeclaration[]` of a function that have {@link str} has parameters
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

/**
 * Returns a TransformerFactory to add an interface to a class
 * @param interfaceToAdd
 * @param classIdentifier
 */
export const addInterfaceToClassTransformerFactory = (
  interfaceToAdd: string,
  classIdentifier: (node: ts.ClassDeclaration) => boolean = () => true
): ts.TransformerFactory<ts.Node> => {
  return (ctx) => (rootNode) => {
    const { factory } = ctx;
    const visit = (node: ts.Node): ts.Node => {
      if (ts.isClassDeclaration(node) && classIdentifier(node)) {
        const implementsClauses = node.heritageClauses?.find((heritageClause) => heritageClause.token === ts.SyntaxKind.ImplementsKeyword);
        const interfaceToImplements = generateImplementsExpressionWithTypeArguments(interfaceToAdd);

        const newImplementsClauses = implementsClauses
          ? factory.updateHeritageClause(implementsClauses, [...implementsClauses.types, ...interfaceToImplements])
          : factory.createHeritageClause(ts.SyntaxKind.ImplementsKeyword, [...interfaceToImplements]);

        const heritageClauses: ts.HeritageClause[] = [...(node.heritageClauses || [])]
          .filter((h: ts.HeritageClause) => h.token !== ts.SyntaxKind.ImplementsKeyword)
          .concat(newImplementsClauses);

        const newModifiers = ([] as ts.ModifierLike[])
          .concat(ts.getDecorators(node) || [])
          .concat(ts.getModifiers(node) || []);

        return factory.updateClassDeclaration(
          node,
          newModifiers,
          node.name,
          node.typeParameters,
          heritageClauses,
          node.members
        );
      }
      return ts.visitEachChild(node, visit, ctx);
    };
    return ts.visitNode(rootNode, visit);
  };
};

/**
 * Add comment on class properties
 * @param classElements
 * @param comments Dictionnary of comment indexed by properties' name
 */
export const addCommentsOnClassProperties = (
  classElements: ts.ClassElement[],
  comments: Record<string, string>
) => {
  classElements.filter((classElement): classElement is ts.PropertyDeclaration & { name: ts.Identifier } =>
    ts.isPropertyDeclaration(classElement)
    && ts.isIdentifier(classElement.name)
  ).forEach((classElement) => {
    const comment = comments[classElement.name.escapedText.toString()];
    if (!comment) {
      return;
    }
    ts.addSyntheticLeadingComment(
      classElement,
      ts.SyntaxKind.MultiLineCommentTrivia,
      `* ${comment}`,
      true
    );
  });
};

/**
 * Transformer to be used to fix the string literals generated by creating a new SourceFile (for instance, using #generateClassElementsFromString)
 * @param ctx
 */
export const fixStringLiterals: ts.TransformerFactory<ts.SourceFile> = (ctx) => (rootNode) => {
  const { factory } = ctx;
  const visit = (node: ts.Node): ts.Node => {
    if (node.kind === ts.SyntaxKind.StringLiteral) {
      return factory.createStringLiteral(node.getText().replace(/^["'](.*)["']$/, '$1'), true);
    }
    return ts.visitEachChild(node, visit, ctx);
  };
  return ts.visitNode(rootNode, visit) as ts.SourceFile;
};

/**
 * Returns a function to match classElement by method name
 * @param methodName
 */
export const findMethodByName = (methodName: string) => (classElement: ts.ClassElement): classElement is ts.MethodDeclaration =>
  ts.isMethodDeclaration(classElement)
  && ts.isIdentifier(classElement.name)
  && classElement.name.escapedText.toString() === methodName;

/**
 * Add block statements to a method
 * @param node
 * @param factory
 * @param methodName
 * @param blockStatements
 */
export const getSimpleUpdatedMethod = (node: ts.ClassDeclaration, factory: ts.NodeFactory, methodName: string, blockStatements: ts.Statement[]) => {
  const originalMethod = node.members.find(findMethodByName(methodName));
  return originalMethod
    ? factory.updateMethodDeclaration(
      originalMethod,
      ts.getModifiers(originalMethod),
      originalMethod.asteriskToken,
      originalMethod.name,
      originalMethod.questionToken,
      originalMethod.typeParameters,
      originalMethod.parameters,
      originalMethod.type,
      originalMethod.body
        ? factory.updateBlock(
          originalMethod.body,
          originalMethod.body.statements.concat(blockStatements)
        ) : factory.createBlock(blockStatements, true)
    ) : factory.createMethodDeclaration(
      [factory.createToken(ts.SyntaxKind.PublicKeyword)],
      undefined,
      factory.createIdentifier(methodName),
      undefined,
      undefined,
      [],
      undefined,
      factory.createBlock(blockStatements, true)
    );
};

/**
 * Return true is the node is the ExpressionStatement of the TestBedConfiguration
 * @param node
 */
export const isTestBedConfiguration = (node: ts.Node): node is ts.ExpressionStatement & { expression: ts.CallExpression & { expression: ts.PropertyAccessExpression } } =>
  (ts.isExpressionStatement(node)
  && ts.isCallExpression(node.expression)
  && ts.isPropertyAccessExpression(node.expression.expression)
  && ts.isIdentifier(node.expression.expression.expression)
  && node.expression.expression.expression.escapedText.toString() === 'TestBed'
  && node.expression.expression.name.escapedText.toString() === 'configureTestingModule')
  || (ts.isAwaitExpression(node) && isTestBedConfiguration(node.expression));

/**
 * TransformerFactory to add imports at spec initialization and code to be run just after
 * @param imports
 * @param code
 */
export const addImportsAndCodeBlockStatementAtSpecInitializationTransformerFactory = (
  imports: (string | ts.Expression)[],
  code?: string
): ts.TransformerFactory<ts.Node> =>
  (ctx) => (rootNode: ts.Node) => {
    const { factory } = ctx;
    const visit = (node: ts.Node): ts.Node => {
      if (ts.isBlock(node) && !!node.statements.find(isTestBedConfiguration)) {
        return factory.updateBlock(
          node,
          node.statements
            .reduce<ts.Statement[]>((acc, statement) => {
              if (isTestBedConfiguration(statement)) {
                const firstArgProps = (statement.expression.arguments[0] as ts.ObjectLiteralExpression).properties;
                const importsProp = firstArgProps.find((prop): prop is ts.PropertyAssignment & { initializer: ts.ArrayLiteralExpression } =>
                  prop.name?.getText() === 'imports'
                );

                return acc.concat(
                  factory.updateExpressionStatement(
                    statement,
                    factory.updateCallExpression(
                      statement.expression,
                      statement.expression.expression,
                      statement.expression.typeArguments,
                      [
                        factory.createObjectLiteralExpression([
                          ...firstArgProps.filter((prop) => prop.name?.getText() !== 'imports'),
                          factory.createPropertyAssignment('imports', factory.createArrayLiteralExpression(
                            (
                              importsProp
                                ? [...importsProp.initializer.elements]
                                : []
                            ).concat(
                              imports.map((importName) => typeof importName === 'string' ? factory.createIdentifier(importName) : importName)
                            ),
                            true
                          ))
                        ], true)
                      ]
                    )
                  )
                );
              }
              return acc.concat(statement);
            }, [])
            .concat(
              code ? generateBlockStatementsFromString(code) : []
            )
        );
      }
      return ts.visitEachChild(node, visit, ctx);
    };
    return ts.visitNode(rootNode, visit);
  };
