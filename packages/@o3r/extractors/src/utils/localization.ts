import * as ts from 'typescript';

const localizationDecoratorName = 'Localization';

/**
 * Retrieve the localization json files from TS Code
 * @param node TSNode of the angular component class
 */
export function getLocalizationFileFromAngularElement(node: ts.ClassDeclaration): string[] | undefined {
  const localizationPaths: string[] = [];
  node.forEachChild((item) => {
    if (!ts.isPropertyDeclaration(item)) {
      return;
    }

    item.forEachChild((decorator) => {
      if (
        !ts.isDecorator(decorator)
        || !ts.isCallExpression(decorator.expression)
        || !ts.isIdentifier(decorator.expression.expression)
        || decorator.expression.expression.escapedText !== localizationDecoratorName
      ) {
        return;
      }

      const firstArg = decorator.expression.arguments[0];
      if (!firstArg || !ts.isStringLiteral(firstArg)) {
        return;
      }

      localizationPaths.push(firstArg.text);
    });
  });

  return localizationPaths.length > 0 ? localizationPaths : undefined;
}
