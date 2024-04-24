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
  schematic,
  SchematicContext,
  template,
  Tree,
  url
} from '@angular-devkit/schematics';
import {
  addCommentsOnClassProperties,
  addImportsAndCodeBlockStatementAtSpecInitializationTransformerFactory,
  addImportsIntoComponentDecoratorTransformerFactory,
  addImportsRule,
  addInterfaceToClassTransformerFactory,
  applyEsLintFix,
  askConfirmationToConvertComponent,
  createSchematicWithMetricsIfInstalled,
  generateBlockStatementsFromString,
  generateClassElementsFromString,
  getO3rComponentInfoOrThrowIfNotFound,
  isO3rClassComponent,
  NoOtterComponent,
  O3rCliError,
  sortClassElement
} from '@o3r/schematics';
import { addImportToModule } from '@schematics/angular/utility/ast-utils';
import { applyToUpdateRecorder, InsertChange } from '@schematics/angular/utility/change';
import { basename, dirname, posix } from 'node:path';
import * as ts from 'typescript';
import type { NgAddLocalizationSchematicsSchema } from './schema';

const localizationProperties = [
  'translations'
];

const checkLocalization = (componentPath: string, tree: Tree, baseFileName: string) => {
  const files = [
    posix.join(dirname(componentPath), `${baseFileName}.localization.json`),
    posix.join(dirname(componentPath), `${baseFileName}.translation.ts`)
  ];
  if (files.some((file) => tree.exists(file))) {
    throw new O3rCliError(`Unable to add localization to this component because it already has at least one of these files: ${files.join(', ')}.`);
  }

  const componentSourceFile = ts.createSourceFile(
    componentPath,
    tree.readText(componentPath),
    ts.ScriptTarget.ES2020,
    true
  );
  const o3rClassDeclaration = componentSourceFile.statements.find((statement): statement is ts.ClassDeclaration =>
    ts.isClassDeclaration(statement)
    && isO3rClassComponent(statement)
  )!;
  if (o3rClassDeclaration.members.find((classElement) =>
    ts.isPropertyDeclaration(classElement)
    && ts.isIdentifier(classElement.name)
    && localizationProperties.includes(classElement.name.escapedText.toString())
  )) {
    throw new O3rCliError(`Unable to add localization to this component because it already has at least one of these properties: ${localizationProperties.join(', ')}.`);
  }
};

/**
 * Add localization architecture to an existing component
 * @param options
 */
export function ngAddLocalizationFn(options: NgAddLocalizationSchematicsSchema): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    try {
      const baseFileName = basename(options.path, '.component.ts');
      const { name, selector, standalone, templateRelativePath } = getO3rComponentInfoOrThrowIfNotFound(tree, options.path);

      checkLocalization(options.path, tree, baseFileName);

      const properties = {
        ...options,
        componentTranslation: name.concat('Translation'),
        componentSelector: selector,
        name: basename(options.path, '.component.ts')
      };

      const createLocalizationFilesRule: Rule = mergeWith(apply(url('./templates'), [
        template(properties),
        renameTemplateFiles(),
        move(dirname(options.path))
      ]), MergeStrategy.Overwrite);

      const updateComponentRule: Rule = chain([
        addImportsRule(options.path, [
          {
            from: '@angular/core',
            importNames: [
              'Input'
            ]
          },
          {
            from: '@o3r/localization',
            importNames: [
              'Localization',
              ...(standalone ? ['LocalizationModule'] : []),
              'Translatable'
            ]
          },
          {
            from: `./${properties.name}.translation`,
            importNames: [
              'translations',
              properties.componentTranslation
            ]
          }
        ]),
        () => {
          const componentSourceFile = ts.createSourceFile(
            options.path,
            tree.readText(options.path),
            ts.ScriptTarget.ES2020,
            true
          );
          const result = ts.transform(componentSourceFile, [
            addInterfaceToClassTransformerFactory(`Translatable<${properties.componentTranslation}>`, isO3rClassComponent),
            ...(
              standalone
                ? [addImportsIntoComponentDecoratorTransformerFactory(['LocalizationModule'])]
                : []
            ),
            (ctx) => (rootNode: ts.Node) => {
              const { factory } = ctx;
              const visit = (node: ts.Node): ts.Node => {
                if (ts.isClassDeclaration(node) && isO3rClassComponent(node)) {
                  const propertiesToAdd = generateClassElementsFromString(`
              @Input()
              public translations: ${properties.componentTranslation};
            `);
                  const constructorDeclaration = node.members.find((classElement): classElement is ts.ConstructorDeclaration => ts.isConstructorDeclaration(classElement));

                  const localizationConstructorBlockStatements = generateBlockStatementsFromString('this.translations = translations;');

                  const newContructorDeclaration = constructorDeclaration
                    ? factory.updateConstructorDeclaration(
                      constructorDeclaration,
                      ts.getModifiers(constructorDeclaration) || [],
                      constructorDeclaration.parameters,
                      constructorDeclaration.body ? factory.updateBlock(
                        constructorDeclaration.body, constructorDeclaration.body.statements.concat(localizationConstructorBlockStatements)
                      ) : factory.createBlock(localizationConstructorBlockStatements, true)
                    ) : factory.createConstructorDeclaration(
                      [],
                      [],
                      factory.createBlock(localizationConstructorBlockStatements, true)
                    );

                  const newModifiers = ([] as ts.ModifierLike[])
                    .concat(ts.getDecorators(node) || [])
                    .concat(ts.getModifiers(node) || []);

                  const newMembers = node.members
                    .filter((classElement) => !ts.isConstructorDeclaration(classElement))
                    .concat(propertiesToAdd, newContructorDeclaration)
                    .sort(sortClassElement);

                  addCommentsOnClassProperties(
                    newMembers,
                    {
                      translations: 'Localization of the component'
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

          tree.overwrite(options.path, printer.printFile(result.transformed[0] as any as ts.SourceFile));

          const sf = ts.createSourceFile(
            options.path,
            tree.readText(options.path),
            ts.ScriptTarget.ES2020,
            true
          );

          // Has to be done at the end because ts.Printer as some issues with Decorators with arguments
          const translationsPropDeclaration = sf.statements
            .find((statement): statement is ts.ClassDeclaration => ts.isClassDeclaration(statement) && isO3rClassComponent(statement))!
            .members.find((member): member is ts.PropertyDeclaration => ts.isPropertyDeclaration(member) && member.name.getText() === 'translations')!;
          const translationsPropLastDecorator = [...(ts.getDecorators(translationsPropDeclaration) || [])].at(-1)!;
          tree.commitUpdate(
            tree
              .beginUpdate(options.path)
              .insertRight(
                translationsPropLastDecorator.getEnd(),
                `\n  @Localization('./${baseFileName}.localization.json')`
              )
          );

          return tree;
        }
      ]);

      const updateTemplateRule: Rule = () => {
        const templatePath = templateRelativePath && posix.join(dirname(options.path), templateRelativePath);
        if (templatePath && tree.exists(templatePath)) {
          tree.commitUpdate(
            tree
              .beginUpdate(templatePath)
              .insertLeft(0, '<div>Localization: {{ translations.dummyLoc1 | o3rTranslate }}</div>\n')
          );
        }

        return tree;
      };

      const specFilePath = options.specFilePath || posix.join(dirname(options.path), `${baseFileName}.spec.ts`);
      const updateSpecRule: Rule = chain([
        addImportsRule(specFilePath, [
          {
            from: '@angular/core',
            importNames: ['Provider']
          },
          {
            from: '@o3r/localization',
            importNames: ['LocalizationService']
          },
          {
            from: '@o3r/testing/localization',
            importNames: ['mockTranslationModules']
          },
          {
            from: '@ngx-translate/core',
            importNames: ['TranslateCompiler', 'TranslateFakeCompiler']
          }
        ]),
        () => {
          if (!tree.exists(specFilePath)) {
            context.logger.warn(`No update applied on spec file because ${specFilePath} does not exist.`);
            return;
          }

          let specSourceFile = ts.createSourceFile(
            specFilePath,
            tree.readText(specFilePath),
            ts.ScriptTarget.ES2020,
            true
          );

          const recorder = tree.beginUpdate(specFilePath);

          const lastImport = [...specSourceFile.statements].reverse().find((statement) =>
            ts.isImportDeclaration(statement)
          );

          const changes = [new InsertChange(specFilePath, lastImport?.getEnd() || 0, `
const localizationConfiguration = {language: 'en'};
const mockTranslations = {
  en: {${options.activateDummy ? `
    '${properties.componentSelector}.dummyLoc1': 'Dummy 1'
  ` : ''}}
};
const mockTranslationsCompilerProvider: Provider = {
  provide: TranslateCompiler,
  useClass: TranslateFakeCompiler
};
      `)];

          applyToUpdateRecorder(recorder, changes);
          tree.commitUpdate(recorder);

          specSourceFile = ts.createSourceFile(
            specFilePath,
            tree.readText(specFilePath),
            ts.ScriptTarget.ES2020,
            true
          );

          const result = ts.transform(specSourceFile, [
            (ctx) => addImportsAndCodeBlockStatementAtSpecInitializationTransformerFactory(
              [
                ctx.factory.createSpreadElement(ctx.factory.createCallExpression(
                  ctx.factory.createIdentifier('mockTranslationModules'),
                  undefined,
                  [
                    ctx.factory.createIdentifier('localizationConfiguration'),
                    ctx.factory.createIdentifier('mockTranslations'),
                    ctx.factory.createIdentifier('mockTranslationsCompilerProvider')
                  ]
                ))
              ],
              `
              const localizationService = TestBed.inject(LocalizationService);
              localizationService.configure();
            `
            )(ctx)
          ]);

          const printer = ts.createPrinter({
            removeComments: false,
            newLine: ts.NewLineKind.LineFeed
          });

          const newContent = printer.printFile(result.transformed[0] as any as ts.SourceFile);

          tree.overwrite(specFilePath, newContent);

          return tree;
        }
      ]);

      const updateModuleRule: Rule = () => {
        const moduleFilePath = options.path.replace(/component.ts$/, 'module.ts');
        const moduleSourceFile = ts.createSourceFile(
          moduleFilePath,
          tree.readText(moduleFilePath),
          ts.ScriptTarget.ES2020,
          true
        );
        const recorder = tree.beginUpdate(moduleFilePath);
        const changes = addImportToModule(moduleSourceFile, moduleFilePath, 'LocalizationModule', '@o3r/localization');
        applyToUpdateRecorder(recorder, changes);
        tree.commitUpdate(recorder);
      };

      const addDummyKeyRule: Rule = schematic('add-localization-key', {
        path: options.path,
        skipLinter: options.skipLinter,
        key: 'dummyLoc1',
        description: 'Dummy 1 description',
        value: 'Dummy 1'
      });

      return chain([
        createLocalizationFilesRule,
        updateComponentRule,
        updateSpecRule,
        standalone ? noop() : updateModuleRule,
        ...(options.activateDummy ? [addDummyKeyRule, updateTemplateRule] : []),
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
            ngAddLocalizationFn(options)
          ]);
        }
      }
      throw e;
    }
  };
}

/**
 * Add localization architecture to an existing component
 * @param options
 */
export const ngAddLocalization = createSchematicWithMetricsIfInstalled(ngAddLocalizationFn);
