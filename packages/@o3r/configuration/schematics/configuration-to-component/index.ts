import {
  apply,
  chain,
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
  applyEsLintFix,
  generateBlockStatementsFromString,
  generateClassElementsFromString,
  generateImplementsExpressionWithTypeArguments,
  generateParametersDeclarationFromString,
  getO3rComponentInfo,
  isO3rClassComponent,
  isO3rClassDecorator,
  sortClassElement
} from '@o3r/schematics';
import { getLibraryNameFromPath } from '@o3r/schematics';
import { insertImport } from '@schematics/angular/utility/ast-utils';
import { applyToUpdateRecorder, Change } from '@schematics/angular/utility/change';
import { basename, dirname, resolve } from 'node:path';
import * as ts from 'typescript';
import type { NgAddConfigSchematicsSchema } from './schema';

const configProperties = [
  'dynamicConfig$', 'config', 'config$'
];

const checkConfiguration = (componentPath: string, tree: Tree) => {
  const files = [
    resolve(dirname(componentPath), `./${basename(componentPath, '.component.ts')}.configuration.ts`)
  ];
  if (files.some((file) => tree.exists(file))) {
    throw new Error(`Unable to add configuration to this component because it already has at least one of these files: ${files.join(', ')}.`);
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
    throw new Error(`Unable to add config to this component because it already have at least one of these properties: ${configProperties.join(', ')}.`);
  }
};


/**
 * Add configuration to an existing component
 *
 * @param options
 */
export function ngAddConfig(options: NgAddConfigSchematicsSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const componentPath = options.path;
    const { name, selector } = getO3rComponentInfo(tree, componentPath);

    checkConfiguration(componentPath, tree);

    const properties = {
      componentConfig: name.concat('Config'),
      projectName: options.projectName || getLibraryNameFromPath(componentPath),
      componentSelector: selector,
      configKey: strings.underscore(name).toUpperCase(),
      name: basename(componentPath, '.component.ts')
    };

    const createConfigFilesRule: Rule = mergeWith(apply(url('./templates'), [
      template({ ...properties }),
      renameTemplateFiles(),
      move(dirname(componentPath))
    ]), MergeStrategy.Overwrite);

    const updateComponentRule: Rule = () => {
      let componentSourceFile = ts.createSourceFile(
        componentPath,
        tree.readText(componentPath),
        ts.ScriptTarget.ES2020,
        true
      );
      const imports = [
        {
          from: '@o3r/configuration',
          importNames: [
            'ConfigObserver',
            'ConfigurationBaseService',
            'ConfigurationObserver',
            'DynamicConfigurable'
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
      ];
      const recorder = tree.beginUpdate(componentPath);
      const changes = imports.reduce((acc: Change[], { importNames, from }) => acc.concat(
        importNames.map((importName) =>
          insertImport(componentSourceFile, componentPath, importName, from)
        )
      ), []);
      applyToUpdateRecorder(recorder, changes);
      tree.commitUpdate(recorder);

      componentSourceFile = ts.createSourceFile(
        componentPath,
        tree.readText(componentPath),
        ts.ScriptTarget.ES2020,
        true
      );

      const result = ts.transform(componentSourceFile, [(ctx) => (rootNode: ts.Node) => {
        const { factory } = ctx;
        const visit = (node: ts.Node): ts.Node => {
          if (ts.isClassDeclaration(node) && isO3rClassComponent(node)) {
            const implementsClauses = node.heritageClauses?.find((heritageClause) => heritageClause.token === ts.SyntaxKind.ImplementsKeyword);
            const interfaceToImplements = generateImplementsExpressionWithTypeArguments(`OnChanges, DynamicConfigurable<${properties.componentConfig}>`);

            const newImplementsClauses = implementsClauses
              ? factory.updateHeritageClause(implementsClauses, [...implementsClauses.types, ...interfaceToImplements])
              : factory.createHeritageClause(ts.SyntaxKind.ImplementsKeyword, [...interfaceToImplements]);

            const propertiesToAdd = generateClassElementsFromString(`
              @Input()
              public config: Partial<${properties.componentConfig}> | undefined;

              @ConfigObserver()
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
              throw new Error(`Unable to add configurationService because there is already a constructor's parameter with this name in ${componentPath}.`);
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

            const o3rDecorator = (ts.getDecorators(node) || []).find(isO3rClassDecorator)!;
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

            const heritageClauses: ts.HeritageClause[] = [...(node.heritageClauses || [])]
              .filter((h: ts.HeritageClause) => h.token !== ts.SyntaxKind.ImplementsKeyword)
              .concat(newImplementsClauses);

            const newModifiers = [newO3rDecorator]
              .concat((ts.getDecorators(node) || []).filter((decorator) => !isO3rClassDecorator(decorator)))
              .concat((ts.getModifiers(node) || []) as any) as any[] as ts.Modifier[];

            const newMembers = node.members
              .filter((classElement) => !(
                ts.isConstructorDeclaration(classElement) || isNgOnChangesMethod(classElement)
              ))
              .concat(propertiesToAdd, newContructorDeclaration, newNgOnChanges)
              .sort(sortClassElement);

            newMembers.filter((classElement): classElement is ts.PropertyDeclaration & { name: ts.Identifier } =>
              ts.isPropertyDeclaration(classElement)
              && ts.isIdentifier(classElement.name)
              && configProperties.includes(classElement.name.escapedText.toString())
            ).forEach((classElement) => {
              let comment = '';
              switch (classElement.name.escapedText.toString()) {
                case 'config':{
                  comment = '* Input configuration to override the default configuration of the component';
                  break;
                }
                case 'dynamicConfig':{
                  comment = '* Dynamic configuration based on the input override configuration and the configuration service if used by the application';
                  break;
                }
                case 'config$':{
                  comment = '* Configuration stream based on the input and the stored configuration';
                  break;
                }
                default:{
                  break;
                }
              }
              if (!comment) {
                return;
              }
              ts.addSyntheticLeadingComment(
                classElement,
                ts.SyntaxKind.MultiLineCommentTrivia,
                comment,
                true
              );
            });

            return factory.updateClassDeclaration(
              node,
              newModifiers,
              node.name,
              node.typeParameters,
              heritageClauses,
              newMembers
            );
          }
          return ts.visitEachChild(node, visit, ctx);
        };
        return ts.visitNode(rootNode, visit);
      }]);

      const printer = ts.createPrinter({
        removeComments: false,
        newLine: ts.NewLineKind.LineFeed
      });

      tree.overwrite(componentPath, printer.printFile((result.transformed[0] as ts.SourceFile)));
      return tree;
    };

    return chain([
      createConfigFilesRule,
      updateComponentRule,
      options.skipLinter ? noop() : applyEsLintFix()
    ])(tree, context);
  };
}
