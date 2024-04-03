import {
  apply,
  chain,
  externalSchematic,
  MergeStrategy,
  mergeWith,
  move,
  noop,
  renameTemplateFiles,
  Rule,
  SchematicContext,
  strings,
  template,
  Tree,
  url
} from '@angular-devkit/schematics';
import {
  addCommentsOnClassProperties,
  addImportsRule,
  addInterfaceToClassTransformerFactory,
  applyEsLintFix,
  askConfirmationToConvertComponent,
  createSchematicWithMetricsIfInstalled,
  generateBlockStatementsFromString,
  generateClassElementsFromString,
  generateParametersDeclarationFromString,
  getLibraryNameFromPath,
  getO3rComponentInfoOrThrowIfNotFound,
  isO3rClassComponent,
  isO3rClassDecorator,
  NoOtterComponent,
  O3rCliError,
  sortClassElement
} from '@o3r/schematics';
import { basename, dirname, posix } from 'node:path';
import * as ts from 'typescript';
import type { NgAddConfigSchematicsSchema } from './schema';

const configProperties = [
  'dynamicConfig$', 'config', 'config$', 'configSignal'
];

const checkConfiguration = (componentPath: string, tree: Tree) => {
  const files = [
    posix.join(dirname(componentPath), `${basename(componentPath, '.component.ts')}.config.ts`)
  ];
  if (files.some((file) => tree.exists(file))) {
    throw new O3rCliError(`Unable to add configuration to this component because it already has at least one of these files: ${files.join(', ')}.`);
  }

  const componentSourceFile = ts.createSourceFile(
    componentPath,
    tree.readText(componentPath),
    ts.ScriptTarget.ES2020,
    true
  );
  const o3rClassDeclaration = componentSourceFile.statements
    .find((statement): statement is ts.ClassDeclaration =>
      ts.isClassDeclaration(statement)
      && isO3rClassComponent(statement)
    )!;
  if (o3rClassDeclaration.members.find((classElement) =>
    ts.isPropertyDeclaration(classElement)
    && ts.isIdentifier(classElement.name)
    && configProperties.includes(classElement.name.escapedText.toString())
  )) {
    throw new O3rCliError(`Unable to add config to this component because it already have at least one of these properties: ${configProperties.join(', ')}.`);
  }
};

/**
 * Add configuration to an existing component
 * @param options
 */
export function ngAddConfigFn(options: NgAddConfigSchematicsSchema): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    try {
      const componentPath = options.path;
      const { name } = getO3rComponentInfoOrThrowIfNotFound(tree, componentPath);

      checkConfiguration(componentPath, tree);

      const properties = {
        componentConfig: name.concat('Config'),
        projectName: options.projectName || getLibraryNameFromPath(componentPath),
        configKey: strings.underscore(name).toUpperCase(),
        name: basename(componentPath, '.component.ts')
      };

      const createConfigFilesRule: Rule = mergeWith(apply(url('./templates'), [
        template(properties),
        renameTemplateFiles(),
        move(dirname(componentPath))
      ]), MergeStrategy.Overwrite);

      const updateComponentRulesWithObservable: Rule = chain([
        addImportsRule(componentPath, [
          {
            from: '@o3r/configuration',
            importNames: [
              'ConfigurationBaseService',
              'ConfigurationObserver',
              'DynamicConfigurable',
              'O3rConfig'
            ]
          },
          {
            from: `./${properties.name}.config`,
            importNames: [
              `${properties.configKey}_DEFAULT_CONFIG`,
              `${properties.configKey}_CONFIG_ID`,
              properties.componentConfig
            ]
          },
          {
            from: '@angular/core',
            importNames: [
              'Input',
              'Optional',
              'OnChanges',
              'SimpleChanges'
            ]
          },
          {
            from: 'rxjs',
            importNames: [
              'Observable'
            ]
          }
        ]),
        () => {
          const componentSourceFile = ts.createSourceFile(
            componentPath,
            tree.readText(componentPath),
            ts.ScriptTarget.ES2020,
            true
          );

          const result = ts.transform(componentSourceFile, [
            addInterfaceToClassTransformerFactory(`OnChanges, DynamicConfigurable<${properties.componentConfig}>`, isO3rClassComponent),
            (ctx) => (rootNode: ts.Node) => {
              const { factory } = ctx;
              const visit = (node: ts.Node): ts.Node => {
                if (ts.isClassDeclaration(node) && isO3rClassComponent(node)) {
                  const propertiesToAdd = generateClassElementsFromString(`
  @Input()
  public config: Partial<${properties.componentConfig}> | undefined;

  @O3rConfig()
  private dynamicConfig$: ConfigurationObserver<${properties.componentConfig}>;

  public config$: Observable<${properties.componentConfig}>;
            `);
                  const constructorDeclaration = node.members.find((classElement): classElement is ts.ConstructorDeclaration => ts.isConstructorDeclaration(classElement));
                  const configurationService = constructorDeclaration?.parameters.find((parameter): parameter is ts.ParameterDeclaration & { name: ts.Identifier } =>
                    !!parameter.type
              && ts.isTypeReferenceNode(parameter.type)
              && ts.isIdentifier(parameter.type.typeName)
              && parameter.type.typeName.escapedText.toString() === 'ConfigurationBaseService'
              && ts.isIdentifier(parameter.name)
                  );
                  if (
                    !configurationService
              && constructorDeclaration?.parameters.find((parameter) =>
                ts.isIdentifier(parameter.name)
                && parameter.name.escapedText.toString() === 'configurationService'
              )
                  ) {
                    throw new O3rCliError(`Unable to add configurationService because there is already a constructor's parameter with this name in ${componentPath}.`);
                  }
                  const configurationServiceVariableName = configurationService?.name.escapedText.toString() || 'configurationService';
                  const configServiceParameter = generateParametersDeclarationFromString(`@Optional() ${configurationServiceVariableName}: ConfigurationBaseService`);

                  const configConstructorBlockStatements = generateBlockStatementsFromString(`
              this.dynamicConfig$ = new ConfigurationObserver<${
  properties.componentConfig
}>(${properties.configKey}_CONFIG_ID, ${properties.configKey}_DEFAULT_CONFIG, ${
  configurationServiceVariableName
});
              this.config$ = this.dynamicConfig$.asObservable();
            `);

                  const newContructorDeclaration = constructorDeclaration
                    ? factory.updateConstructorDeclaration(
                      constructorDeclaration,
                      ts.getModifiers(constructorDeclaration) || [],
                      constructorDeclaration.parameters.concat(configurationService ? [] : configServiceParameter),
                      constructorDeclaration.body ? factory.updateBlock(
                        constructorDeclaration.body, constructorDeclaration.body.statements.concat(configConstructorBlockStatements)
                      ) : factory.createBlock(configConstructorBlockStatements, true)
                    ) : factory.createConstructorDeclaration(
                      [],
                      configServiceParameter,
                      factory.createBlock(configConstructorBlockStatements, true)
                    );

                  const isNgOnChangesMethod = (classElement: ts.ClassElement): classElement is ts.MethodDeclaration =>
                    ts.isMethodDeclaration(classElement)
              && ts.isIdentifier(classElement.name)
              && classElement.name.escapedText.toString() === 'ngOnChanges';

                  const ngOnChangesMethod = node.members.find(isNgOnChangesMethod);

                  const changesVariableName = ngOnChangesMethod?.parameters[0].name.getText() || 'changes';

                  const ifStatementToAdd = generateBlockStatementsFromString(`
              if (${changesVariableName}.config) {
                this.dynamicConfig$.next(this.config);
              }
            `);

                  const newNgOnChanges = ngOnChangesMethod
                    ? factory.updateMethodDeclaration(
                      ngOnChangesMethod,
                      ts.getModifiers(ngOnChangesMethod),
                      ngOnChangesMethod.asteriskToken,
                      ngOnChangesMethod.name,
                      ngOnChangesMethod.questionToken,
                      ngOnChangesMethod.typeParameters,
                      ngOnChangesMethod.parameters?.length
                        ? ngOnChangesMethod.parameters
                        : generateParametersDeclarationFromString(`${changesVariableName}: SimpleChanges`),
                      ngOnChangesMethod.type,
                      ngOnChangesMethod.body
                        ? factory.updateBlock(
                          ngOnChangesMethod.body,
                          ngOnChangesMethod.body.statements.concat(ifStatementToAdd)
                        ) : factory.createBlock(ifStatementToAdd, true)
                    ) : factory.createMethodDeclaration(
                      [factory.createToken(ts.SyntaxKind.PublicKeyword)],
                      undefined,
                      factory.createIdentifier('ngOnChanges'),
                      undefined,
                      undefined,
                      generateParametersDeclarationFromString(`${changesVariableName}: SimpleChanges`),
                      undefined,
                      factory.createBlock(ifStatementToAdd, true)
                    );

                  const decorators = ts.getDecorators(node)!;
                  const o3rDecorator = decorators.find(isO3rClassDecorator)!;
                  const firstArg = o3rDecorator.expression.arguments[0];
                  const shouldUpdateDecorator = options.exposeComponent && ts.isObjectLiteralExpression(firstArg) && firstArg.properties.find((prop) =>
                    ts.isPropertyAssignment(prop)
              && prop.name?.getText() === 'componentType'
              && ts.isStringLiteral(prop.initializer)
              && prop.initializer.text === 'Component'
                  );
                  const newO3rDecorator = shouldUpdateDecorator ? factory.updateDecorator(
                    o3rDecorator,
                    factory.updateCallExpression(
                      o3rDecorator.expression,
                      o3rDecorator.expression.expression,
                      o3rDecorator.expression.typeArguments,
                      [
                        factory.createObjectLiteralExpression([
                          ...(o3rDecorator.expression.arguments[0] as ts.ObjectLiteralExpression).properties.filter((prop) => prop.name?.getText() !== 'componentType'),
                          factory.createPropertyAssignment('componentType', factory.createStringLiteral('ExposedComponent', true))
                        ])
                      ]
                    )
                  )
                    : o3rDecorator;

                  const newModifiers = [newO3rDecorator]
                    .concat(decorators.filter((decorator) => !isO3rClassDecorator(decorator)))
                    .concat((ts.getModifiers(node) || []) as any) as any[] as ts.Modifier[];

                  const newMembers = node.members
                    .filter((classElement) => !(
                      ts.isConstructorDeclaration(classElement) || isNgOnChangesMethod(classElement)
                    ))
                    .concat(propertiesToAdd, newContructorDeclaration, newNgOnChanges)
                    .sort(sortClassElement);

                  addCommentsOnClassProperties(
                    newMembers,
                    {
                      config: '@inheritDoc',
                      dynamicConfig: 'Dynamic configuration based on the input override configuration and the configuration service if used by the application',
                      config$: '@inheritDoc'
                    }
                  );

                  return factory.updateClassDeclaration(
                    node,
                    newModifiers,
                    node.name,
                    node.typeParameters,
                    node.heritageClauses,
                    newMembers
                  );
                }
                return ts.visitEachChild(node, visit, ctx);
              };
              return ts.visitNode(rootNode, visit);
            }
          ]);

          const printer = ts.createPrinter({
            removeComments: false,
            newLine: ts.NewLineKind.LineFeed
          });

          tree.overwrite(componentPath, printer.printFile(result.transformed[0] as any as ts.SourceFile));
          return tree;
        }
      ]);

      const updateComponentRulesWithSignal: Rule = chain([
        addImportsRule(componentPath, [
          {
            from: '@angular/core',
            importNames: [
              'inject',
              'input'
            ]
          },
          {
            from: '@o3r/configuration',
            importNames: [
              'configSignal',
              'O3rConfig',
              'DynamicConfigurableWithSignal'
            ]
          },
          {
            from: `./${properties.name}.config`,
            importNames: [
              `${properties.configKey}_DEFAULT_CONFIG`,
              `${properties.configKey}_CONFIG_ID`,
              properties.componentConfig
            ]
          }
        ]),
        () => {
          const componentSourceFile = ts.createSourceFile(
            componentPath,
            tree.readText(componentPath),
            ts.ScriptTarget.ES2020,
            true
          );

          const result = ts.transform(componentSourceFile, [
            addInterfaceToClassTransformerFactory(`DynamicConfigurableWithSignal<${properties.componentConfig}>`, isO3rClassComponent),
            (ctx) => (rootNode: ts.Node) => {
              const { factory } = ctx;
              const visit = (node: ts.Node): ts.Node => {
                if (ts.isClassDeclaration(node) && isO3rClassComponent(node)) {
                  const propertiesToAdd = generateClassElementsFromString(`
  public config = input<Partial<${properties.componentConfig}>>();

  @O3rConfig()
  public readonly configSignal = configSignal(this.config, ${properties.configKey}_CONFIG_ID, ${properties.configKey}_DEFAULT_CONFIG);`);

                  const decorators = ts.getDecorators(node)!;
                  const o3rDecorator = decorators.find(isO3rClassDecorator)!;
                  const firstArg = o3rDecorator.expression.arguments[0];
                  const shouldUpdateDecorator = options.exposeComponent && ts.isObjectLiteralExpression(firstArg) && firstArg.properties.find((prop) =>
                    ts.isPropertyAssignment(prop)
              && prop.name?.getText() === 'componentType'
              && ts.isStringLiteral(prop.initializer)
              && prop.initializer.text === 'Component'
                  );
                  const newO3rDecorator = shouldUpdateDecorator ? factory.updateDecorator(
                    o3rDecorator,
                    factory.updateCallExpression(
                      o3rDecorator.expression,
                      o3rDecorator.expression.expression,
                      o3rDecorator.expression.typeArguments,
                      [
                        factory.createObjectLiteralExpression([
                          ...(o3rDecorator.expression.arguments[0] as ts.ObjectLiteralExpression).properties.filter((prop) => prop.name?.getText() !== 'componentType'),
                          factory.createPropertyAssignment('componentType', factory.createStringLiteral('ExposedComponent', true))
                        ])
                      ]
                    )
                  )
                    : o3rDecorator;

                  const newModifiers = [newO3rDecorator]
                    .concat(decorators.filter((decorator) => !isO3rClassDecorator(decorator)))
                    .concat((ts.getModifiers(node) || []) as any) as any[] as ts.Modifier[];

                  const newMembers = propertiesToAdd.concat(node.members);

                  addCommentsOnClassProperties(
                    newMembers,
                    {
                      config: '@inheritDoc',
                      configSignal: '@inheritDoc'
                    }
                  );

                  return factory.updateClassDeclaration(
                    node,
                    newModifiers,
                    node.name,
                    node.typeParameters,
                    node.heritageClauses,
                    newMembers
                  );
                }
                return ts.visitEachChild(node, visit, ctx);
              };
              return ts.visitNode(rootNode, visit);
            }
          ]);

          const printer = ts.createPrinter({
            removeComments: false,
            newLine: ts.NewLineKind.LineFeed
          });

          tree.overwrite(componentPath, printer.printFile(result.transformed[0] as any as ts.SourceFile));
          return tree;
        }
      ]);

      return chain([
        createConfigFilesRule,
        options.useSignal ? updateComponentRulesWithSignal : updateComponentRulesWithObservable,
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
            ngAddConfigFn(options)
          ]);
        }
      }
      throw e;
    }
  };
}

/**
 * Add configuration to an existing component
 * @param options
 */
export const ngAddConfig = createSchematicWithMetricsIfInstalled(ngAddConfigFn);
