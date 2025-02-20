import {
  dirname,
  posix,
} from 'node:path';
import {
  askConfirmation,
} from '@angular/cli/src/utilities/prompt';
import {
  chain,
  externalSchematic,
  noop,
  Rule,
  schematic,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import {
  applyEsLintFix,
  askConfirmationToConvertComponent,
  askUserInput,
  createOtterSchematic,
  getO3rComponentInfoOrThrowIfNotFound,
  isO3rClassComponent,
  NoOtterComponent,
  O3rCliError,
} from '@o3r/schematics';
import * as ts from 'typescript';
import type {
  NgAddLocalizationKeySchematicsSchema,
} from './schema';

class NoLocalizationArchitecture extends Error {
  constructor(componentPath: string) {
    super(
      `This component is not localized. If you want to localize this component you can run the following command:\nng g @o3r/localization:localization-to-component --path="${componentPath}"`
    );
  }
}

class KeyAlreadyExists extends Error {
  constructor(key: string, file: string) {
    super(`There is already a key named ${key} in ${file}.`);
  }
}

const getLocalizationInformation = (componentPath: string, tree: Tree) => {
  const componentSourceFile = ts.createSourceFile(
    componentPath,
    tree.readText(componentPath),
    ts.ScriptTarget.ES2015,
    true
  );

  const o3rClass = componentSourceFile.statements.find((statement): statement is ts.ClassDeclaration => ts.isClassDeclaration(statement) && isO3rClassComponent(statement))!;
  let localizationJsonPath: string | undefined;
  let defaultTranslationVariableName: string | undefined;
  let translationsVariableName: string | undefined;
  let translationsVariableType: string | undefined;
  o3rClass.members.forEach((member) => {
    if (ts.isPropertyDeclaration(member) && ts.isIdentifier(member.name) && member.type && ts.isTypeReferenceNode(member.type) && ts.isIdentifier(member.type.typeName)) {
      const decorators = [...(ts.getDecorators(member) || [])];
      const localizationDecorator = decorators.find((decorator): decorator is ts.Decorator & { expression: ts.CallExpression & { arguments: [ts.StringLiteral] } } =>
        ts.isCallExpression(decorator.expression)
        && ts.isIdentifier(decorator.expression.expression)
        && decorator.expression.expression.escapedText.toString() === 'Localization'
        && ts.isStringLiteral(decorator.expression.arguments[0])
      );
      if (localizationDecorator) {
        localizationJsonPath = posix.join(dirname(componentPath), localizationDecorator.expression.arguments[0].text);
        translationsVariableName = member.name.escapedText.toString();
        translationsVariableType = member.type.typeName.escapedText.toString();
        if (member.initializer && ts.isIdentifier(member.initializer)) {
          defaultTranslationVariableName = member.initializer.escapedText.toString();
        }
      }
    }
  });

  if (!localizationJsonPath || !tree.exists(localizationJsonPath)) {
    throw new NoLocalizationArchitecture(componentPath);
  }

  if (!defaultTranslationVariableName) {
    const constructor = o3rClass.members.find((member) => ts.isConstructorDeclaration(member));
    if (constructor?.body) {
      constructor.body.statements.forEach((statement) => {
        if (
          ts.isExpressionStatement(statement)
          && ts.isBinaryExpression(statement.expression)
          && ts.isPropertyAccessExpression(statement.expression.left)
          && statement.expression.left.name.escapedText.toString() === translationsVariableName
          && ts.isIdentifier(statement.expression.right)
        ) {
          defaultTranslationVariableName = statement.expression.right.escapedText.toString();
        }
      });
    }
  }

  if (!defaultTranslationVariableName) {
    throw new O3rCliError(`Unable to find initialization of ${translationsVariableName!} in ${componentPath}.`);
  }

  const importDeclaration = componentSourceFile.statements.find((statement): statement is ts.ImportDeclaration & { moduleSpecifier: ts.StringLiteral } =>
    ts.isImportDeclaration(statement)
    && ts.isStringLiteral(statement.moduleSpecifier)
    && !!statement.importClause
    && !!statement.importClause.namedBindings
    && ts.isNamedImports(statement.importClause.namedBindings)
    && statement.importClause.namedBindings.elements.some((element) => ts.isIdentifier(element.name) && element.name.escapedText.toString() === defaultTranslationVariableName)
  );
  if (!importDeclaration) {
    throw new O3rCliError(`Unable to find import declaration of ${defaultTranslationVariableName} in ${componentPath}`);
  }
  const translationsPath = posix.join(dirname(componentPath), `${importDeclaration.moduleSpecifier.text}.ts`);

  return {
    localizationJsonPath,
    translationsPath,
    translationsVariableType
  };
};

/**
 * Add localization key to an existing component
 * @param options
 */
export function ngAddLocalizationKeyFn(options: NgAddLocalizationKeySchematicsSchema): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    try {
      const { selector, templateRelativePath } = getO3rComponentInfoOrThrowIfNotFound(tree, options.path);
      const { localizationJsonPath, translationsPath, translationsVariableType } = getLocalizationInformation(options.path, tree);

      const properties = {
        ...options,
        keyName: options.key,
        keyValue: `${selector}.${options.key}`,
        defaultValue: options.value
      };

      const localizationJson = tree.readJson(localizationJsonPath) || {};
      if ((localizationJson as any)[properties.keyValue]) {
        throw new KeyAlreadyExists(properties.keyValue, localizationJsonPath);
      }
      const translationFileContent = tree.readText(translationsPath);
      if (new RegExp(`${properties.keyName}:`).test(translationFileContent)) {
        throw new KeyAlreadyExists(properties.keyName, translationsPath);
      }

      const updateLocalizationFileRule: Rule = () => {
        (localizationJson as any)[properties.keyValue] = {
          ...(properties.dictionary
            ? {
              dictionary: true
            }
            : {
              defaultValue: properties.defaultValue
            }),
          description: properties.description
        };
        tree.overwrite(localizationJsonPath, JSON.stringify(localizationJson, null, 2));
        return tree;
      };

      const updateTranslationFileRule: Rule = () => {
        const translationSourceFile = ts.createSourceFile(
          translationsPath,
          tree.readText(translationsPath),
          ts.ScriptTarget.ES2020,
          true
        );

        const result = ts.transform(translationSourceFile, [(ctx) => (rootNode: ts.Node) => {
          const { factory } = ctx;
          const visit = (node: ts.Node): ts.Node => {
            if (
              ts.isInterfaceDeclaration(node)
              && node.name.escapedText.toString() === translationsVariableType
            ) {
              return factory.updateInterfaceDeclaration(
                node,
                ts.getModifiers(node),
                node.name,
                node.typeParameters,
                node.heritageClauses,
                node.members.concat(
                  factory.createPropertySignature(
                    undefined,
                    factory.createIdentifier(properties.keyName),
                    undefined,
                    factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                  )
                )
              );
            }
            if (
              ts.isVariableDeclaration(node)
              && node.type
              && (
                (
                  ts.isTypeReferenceNode(node.type)
                  && ts.isIdentifier(node.type.typeName)
                  && node.type.typeName.escapedText.toString() === translationsVariableType
                )
                || (
                  ts.isTypeReferenceNode(node.type)
                  && ts.isIdentifier(node.type.typeName)
                  && node.type.typeName.escapedText.toString() === 'Readonly'
                  && node.type.typeArguments?.[0]
                  && ts.isTypeReferenceNode(node.type.typeArguments[0])
                  && ts.isIdentifier(node.type.typeArguments[0].typeName)
                  && node.type.typeArguments[0].typeName.escapedText.toString() === translationsVariableType
                )
              )
              && node.initializer
            ) {
              if (ts.isObjectLiteralExpression(node.initializer)) {
                return factory.updateVariableDeclaration(
                  node,
                  node.name,
                  node.exclamationToken,
                  node.type,
                  factory.updateObjectLiteralExpression(
                    node.initializer,
                    node.initializer.properties.concat(
                      factory.createPropertyAssignment(
                        factory.createIdentifier(properties.keyName),
                        factory.createStringLiteral(properties.keyValue, true)
                      )
                    )
                  )
                );
              } else if (
                ts.isAsExpression(node.initializer)
                && ts.isTypeReferenceNode(node.initializer.type)
                && ts.isIdentifier(node.initializer.type.typeName)
                && node.initializer.type.typeName.escapedText.toString() === 'const'
                && ts.isObjectLiteralExpression(node.initializer.expression)
              ) {
                return factory.updateVariableDeclaration(
                  node,
                  node.name,
                  node.exclamationToken,
                  node.type,
                  factory.updateAsExpression(
                    node.initializer,
                    factory.updateObjectLiteralExpression(
                      node.initializer.expression,
                      node.initializer.expression.properties.concat(
                        factory.createPropertyAssignment(
                          factory.createIdentifier(properties.keyName),
                          factory.createStringLiteral(properties.keyValue, true)
                        )
                      )
                    ),
                    node.initializer.type
                  )
                );
              }
            }
            return ts.visitEachChild(node, visit, ctx);
          };
          return ts.visitNode(rootNode, visit);
        }]);

        const printer = ts.createPrinter({
          removeComments: false,
          newLine: ts.NewLineKind.LineFeed
        });

        tree.overwrite(translationsPath, printer.printFile(result.transformed[0] as any as ts.SourceFile));
        return tree;
      };

      const updateTemplateFile: Rule = () => {
        const templatePath = templateRelativePath && posix.join(dirname(options.path), templateRelativePath);
        if (templatePath) {
          tree.overwrite(
            templatePath,
            tree.readText(templatePath).replaceAll(options.value, `{{ translations.${properties.keyName} | o3rTranslate }}`)
          );
        }
      };

      return chain([
        updateLocalizationFileRule,
        updateTranslationFileRule,
        options.value && options.updateTemplate ? updateTemplateFile : noop(),
        options.skipLinter ? noop() : applyEsLintFix()
      ]);
    } catch (e) {
      if (e instanceof NoOtterComponent && context.interactive) {
        const shouldConvertComponent = await askConfirmationToConvertComponent();
        if (shouldConvertComponent) {
          return chain([
            externalSchematic('@o3r/core', 'convert-component', {
              path: options.path
            }),
            ngAddLocalizationKeyFn(options)
          ]);
        }
      } else if (e instanceof NoLocalizationArchitecture && context.interactive) {
        const shouldAddLocalization = await askConfirmation('This component is not localized. Would you like to add the localization architecture?', true);
        if (shouldAddLocalization) {
          return chain([
            schematic('localization-to-component', {
              path: options.path
            }),
            ngAddLocalizationKeyFn(options)
          ]);
        }
      } else if (e instanceof KeyAlreadyExists && context.interactive) {
        const newKey = await askUserInput(
          `${e.message}\nPlease choose another key name:`
        );
        return ngAddLocalizationKeyFn({
          ...options,
          key: newKey
        });
      }
      throw e;
    }
  };
}

/**
 * Add localization key to an existing component
 * @param options
 */
export const ngAddLocalizationKey = createOtterSchematic(ngAddLocalizationKeyFn);
