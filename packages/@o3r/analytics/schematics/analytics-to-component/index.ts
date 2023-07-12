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
  template,
  Tree,
  url
} from '@angular-devkit/schematics';
import { getPropertyFromDecoratorFirstArgument } from '@o3r/schematics';
import {
  addCommentsOnClassProperties,
  addImportsRule,
  addInterfaceToClassTransformerFactory,
  applyEsLintFix,
  generateClassElementsFromString,
  getO3rComponentInfoOrThrowIfNotFound,
  isNgClassDecorator,
  isO3rClassComponent,
  sortClassElement
} from '@o3r/schematics';
import { addImportToModule } from '@schematics/angular/utility/ast-utils';
import { applyToUpdateRecorder } from '@schematics/angular/utility/change';
import { basename, dirname, posix } from 'node:path';
import * as ts from 'typescript';
import type { NgAddAnalyticsSchematicsSchema } from './schema';

const analyticsProperties = [
  'analyticsEvents'
];

const checkAnalytics = (componentPath: string, tree: Tree, baseFileName: string) => {
  const files = [
    posix.join(componentPath, `${baseFileName}.analytics.ts`)
  ];
  if (files.some((file) => tree.exists(file))) {
    throw new Error(`Unable to add analytics to this component because it already has at least one of these files: ${files.join(', ')}.`);
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
    && analyticsProperties.includes(classElement.name.escapedText.toString())
  )) {
    throw new Error(`Unable to add analytics to this component because it already has at least one of these properties: ${analyticsProperties.join(', ')}.`);
  }
};

/**
 * Add analytics to an existing component
 *
 * @param options
 */
export function ngAddAnalytics(options: NgAddAnalyticsSchematicsSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const baseFileName = basename(options.path, '.component.ts');
    const { name, standalone, templateRelativePath } = getO3rComponentInfoOrThrowIfNotFound(tree, options.path);

    checkAnalytics(options.path, tree, baseFileName);

    const properties = {
      ...options,
      componentName: name,
      componentAnalytics: name.concat('Analytics'),
      name: basename(options.path, '.component.ts')
    };

    const createAnalyticsFilesRule: Rule = mergeWith(apply(url('./templates'), [
      template(properties),
      renameTemplateFiles(),
      move(dirname(options.path))
    ]), MergeStrategy.Overwrite);

    const updateComponentRule: Rule = chain([
      addImportsRule(options.path, [
        {
          from: '@o3r/analytics',
          importNames: [
            ...(standalone ? ['TrackEventsModule'] : []),
            'Trackable'
          ]
        },
        {
          from: `./${properties.name}.analytics`,
          importNames: [
            'analyticsEvents',
            properties.componentAnalytics
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
          addInterfaceToClassTransformerFactory(`Trackable<${properties.componentAnalytics}>`, isO3rClassComponent),
          (ctx) => (rootNode: ts.Node) => {
            const { factory } = ctx;
            const visit = (node: ts.Node): ts.Node => {
              if (ts.isClassDeclaration(node) && isO3rClassComponent(node)) {
                const propertiesToAdd = generateClassElementsFromString(`
              public readonly analyticsEvents: ${properties.componentAnalytics} = analyticsEvents;
            `);

                const ngDecorator = (ts.getDecorators(node) || []).find(isNgClassDecorator)!;
                const importInitializer = standalone ? getPropertyFromDecoratorFirstArgument(ngDecorator, 'imports') : undefined;
                const importsList = importInitializer && ts.isArrayLiteralExpression(importInitializer) ? [...importInitializer.elements] : [];
                const newNgDecorator = standalone ? factory.updateDecorator(
                  ngDecorator,
                  factory.updateCallExpression(
                    ngDecorator.expression,
                    ngDecorator.expression.expression,
                    ngDecorator.expression.typeArguments,
                    [
                      factory.createObjectLiteralExpression([
                        ...(ngDecorator.expression.arguments[0] as ts.ObjectLiteralExpression).properties.filter((prop) => prop.name?.getText() !== 'imports'),
                        factory.createPropertyAssignment('imports', factory.createArrayLiteralExpression(
                          importsList.concat(factory.createIdentifier('TrackEventsModule')),
                          true
                        ))
                      ], true)
                    ]
                  )
                ) : ngDecorator;


                const newModifiers = (ts.getDecorators(node) || []).filter((decorator) => !isNgClassDecorator(decorator))
                  .concat([newNgDecorator])
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                  .concat((ts.getModifiers(node) || []) as any) as any[] as ts.Modifier[];

                const newMembers = node.members
                  .concat(propertiesToAdd)
                  .sort(sortClassElement);

                addCommentsOnClassProperties(
                  newMembers,
                  {
                    analyticsEvents: '@inheritDoc'
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

        return tree;
      }
    ]);

    const updateTemplateRule: Rule = () => {
      const templatePath = templateRelativePath && posix.join(dirname(options.path), templateRelativePath);
      if (templatePath && tree.exists(templatePath)) {
        tree.commitUpdate(
          tree
            .beginUpdate(templatePath)
            .insertLeft(0, `
<button trackClick [trackEventContextConstructor]="analyticsEvents.dummyEvent"></button>
<button trackClick
        [trackEventContextConstructor]="analyticsEvents.runtimeDummyEvent"
        [trackEventContextConstructorParameters]="{runtimedata: 'runtimedata'}">
</button>
            `)
        );
      }

      return tree;
    };

    const updateModuleRule: Rule = () => {
      const moduleFilePath = options.path.replace(/component.ts$/, 'module.ts');
      const moduleSourceFile = ts.createSourceFile(
        moduleFilePath,
        tree.readText(moduleFilePath),
        ts.ScriptTarget.ES2020,
        true
      );
      const recorder = tree.beginUpdate(moduleFilePath);
      const changes = addImportToModule(moduleSourceFile, moduleFilePath, 'TrackEventsModule', '@o3r/analytics');
      applyToUpdateRecorder(recorder, changes);
      tree.commitUpdate(recorder);
    };

    return chain([
      createAnalyticsFilesRule,
      updateComponentRule,
      standalone ? noop() : updateModuleRule,
      options.activateDummy ? updateTemplateRule : noop(),
      options.skipLinter ? noop() : applyEsLintFix()
    ])(tree, context);
  };
}
