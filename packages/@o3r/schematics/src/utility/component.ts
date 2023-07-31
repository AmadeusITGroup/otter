import { Tree } from '@angular-devkit/schematics';
import { askConfirmation } from '@angular/cli/src/utilities/prompt';
import * as ts from 'typescript';
import { DecoratorWithArg, getPropertyFromDecoratorFirstArgument, isDecoratorWithArg } from './ast';

/**
 * Returns true if `node` is the decorator of an Angular component
 *
 * @param node
 */
export const isNgClassDecorator = (node: ts.Node): node is DecoratorWithArg =>
  isDecoratorWithArg(node)
  && node.expression.expression.escapedText.toString() === 'Component';

/**
 * Returns true if `node` is the decorator of an Otter component
 *
 * @param node
 */
export const isO3rClassDecorator = (node: ts.Node): node is DecoratorWithArg =>
  isDecoratorWithArg(node)
  && node.expression.expression.escapedText.toString() === 'O3rComponent';

/**
 * Returns true if `classDeclaration` is an Otter component
 *
 * @param classDeclaration
 */
export const isNgClassComponent = (classDeclaration: ts.ClassDeclaration) => (ts.getDecorators(classDeclaration) || []).some(isNgClassDecorator);

/**
 * Returns true if `classDeclaration` is an Otter component
 *
 * @param classDeclaration
 */
export const isO3rClassComponent = (classDeclaration: ts.ClassDeclaration) =>
  isNgClassComponent(classDeclaration)
  && (ts.getDecorators(classDeclaration) || []).some(isO3rClassDecorator);

export const askConfirmationToConvertComponent = () => askConfirmation('Component found is not an Otter component. Would you like to convert it?', true);

export class NoOtterComponent extends Error {
  constructor(componentPath: string) {
    super(`
      No Otter component found in ${componentPath}.
      You can convert your Angular component into an Otter component by running the following command:
      ng g @o3r/core:convert-component --path="${componentPath}".
    `);
  }
}

/**
 * Returns Otter component information
 *
 * @param tree
 * @param componentPath
 */
export const getO3rComponentInfoOrThrowIfNotFound = (tree: Tree, componentPath: string) => {
  const sourceFile = ts.createSourceFile(
    componentPath,
    tree.readText(componentPath),
    ts.ScriptTarget.ES2020,
    true
  );

  const ngComponentDeclaration = sourceFile.statements.find((s): s is ts.ClassDeclaration => ts.isClassDeclaration(s) && isNgClassComponent(s));

  if (!ngComponentDeclaration) {
    throw new Error(`No Angular component found in ${componentPath}.`);
  }

  if (!isO3rClassComponent(ngComponentDeclaration)) {
    throw new NoOtterComponent(componentPath);
  }

  const name = ngComponentDeclaration.name?.escapedText.toString().replace(/Component$/, '');

  if (!name) {
    throw new Error(`The class' name is not specified. Please provide one for the Otter component defined in ${componentPath}.`);
  }

  const selectorExpression = getPropertyFromDecoratorFirstArgument(
    ts.getDecorators(ngComponentDeclaration)?.find(isNgClassDecorator)!,
    'selector'
  );

  const selector = selectorExpression && ts.isStringLiteral(selectorExpression)
    ? selectorExpression.text
    : selectorExpression?.getText();


  if (!selector) {
    throw new Error(`The component's selector is not specified. Please provide one for the Otter component defined in ${componentPath}.`);
  }

  const standaloneExpression = getPropertyFromDecoratorFirstArgument(
    ts.getDecorators(ngComponentDeclaration)?.find(isNgClassDecorator)!,
    'standalone'
  );

  const standalone = standaloneExpression?.kind === ts.SyntaxKind.TrueKeyword;

  const templateUrlExpression = getPropertyFromDecoratorFirstArgument(
    ts.getDecorators(ngComponentDeclaration)?.find(isNgClassDecorator)!,
    'templateUrl'
  );

  const templateRelativePath = templateUrlExpression && ts.isStringLiteral(templateUrlExpression)
    ? templateUrlExpression.text
    : templateUrlExpression?.getText();

  return {
    name,
    selector,
    standalone,
    templateRelativePath
  };
};

/**
 * Transformer factory to add imports into the angular component decorator
 *
 * @param imports
 */
export const addImportsIntoComponentDecoratorTransformerFactory = (
  imports: string[]
): ts.TransformerFactory<ts.Node> => (ctx) => (rootNode: ts.Node) => {
  const { factory } = ctx;
  const visit = (node: ts.Node): ts.Node => {
    if (isNgClassDecorator(node)) {
      const importInitializer = getPropertyFromDecoratorFirstArgument(node, 'imports');
      const importsList = importInitializer && ts.isArrayLiteralExpression(importInitializer) ? [...importInitializer.elements] : [];

      return factory.updateDecorator(
        node,
        factory.updateCallExpression(
          node.expression,
          node.expression.expression,
          node.expression.typeArguments,
          [
            factory.createObjectLiteralExpression([
              ...(node.expression.arguments[0] as ts.ObjectLiteralExpression).properties.filter((prop) => prop.name?.getText() !== 'imports'),
              factory.createPropertyAssignment('imports', factory.createArrayLiteralExpression(
                importsList.concat(imports.map((importName) => factory.createIdentifier(importName))),
                true
              ))
            ], true)
          ]
        )
      );
    }
    return ts.visitEachChild(node, visit, ctx);
  };
  return ts.visitNode(rootNode, visit);
};
