import {
  chain,
  externalSchematic,
  noop,
  Rule,
  SchematicContext,
  Tree
} from '@angular-devkit/schematics';
import {
  addCommentsOnClassProperties,
  addImportsRule,
  applyEsLintFix,
  askConfirmationToConvertComponent,
  findMethodByName,
  fixStringLiterals,
  generateBlockStatementsFromString,
  generateClassElementsFromString,
  generateImplementsExpressionWithTypeArguments,
  getO3rComponentInfoOrThrowIfNotFound,
  getSimpleUpdatedMethod,
  NoOtterComponent,
  O3rCliError,
  sortClassElement
} from '@o3r/schematics';
import { dirname, posix } from 'node:path';
import * as ts from 'typescript';
import type { NgAddIframeSchematicsSchema } from './schema';

const iframeProperties = [
  'frame',
  'bridge'
];

const checkIframePresence = (componentPath: string, tree: Tree) => {
  const sourceFile = ts.createSourceFile(
    componentPath,
    tree.readText(componentPath),
    ts.ScriptTarget.ES2020,
    true
  );
  const classStatement = sourceFile.statements.find(ts.isClassDeclaration);
  if (
    classStatement?.members.find((classElement) =>
      ts.isPropertyDeclaration(classElement)
      && ts.isIdentifier(classElement.name)
      && iframeProperties.includes(classElement.name.escapedText.toString())
    )
  ) {
    throw new O3rCliError(`Unable to add iframe to this component because it already has at least one of these properties: ${iframeProperties.join(', ')}.`);
  }
};

/**
 * Add iframe to an existing component
 *
 * @param options
 */
export function ngAddIframe(options: NgAddIframeSchematicsSchema): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    try {
      const { templateRelativePath } = getO3rComponentInfoOrThrowIfNotFound(tree, options.path);

      checkIframePresence(options.path, tree);

      const updateComponentFile: Rule = chain([
        addImportsRule(options.path, [
          {
            from: '@angular/core',
            importNames: [
              'AfterViewInit',
              'OnDestroy'
            ]
          },
          {
            from: '@o3r/third-party',
            importNames: [
              'generateIFrameContent',
              'IframeBridge'
            ]
          },
          {
            from: 'rxjs',
            importNames: [
              'Subscription'
            ]
          }
        ]),
        () => {

          const sourceFile = ts.createSourceFile(
            options.path,
            tree.readText(options.path),
            ts.ScriptTarget.ES2020,
            true
          );
          const result = ts.transform(sourceFile, [
            (ctx) => (rootNode: ts.Node) => {
              const { factory } = ctx;
              const visit = (node: ts.Node): ts.Node => {
                if (ts.isClassDeclaration(node)) {
                  const implementsClauses = node.heritageClauses?.find((heritageClause) => heritageClause.token === ts.SyntaxKind.ImplementsKeyword);
                  const interfaceToImplements = generateImplementsExpressionWithTypeArguments('OnDestroy, AfterViewInit');

                  const deduplicateHeritageClauses = (clauses: any[]) =>
                    clauses.filter((h, i) =>
                      !clauses.slice(i + 1).some((h2) => h2.kind === h.kind && h2.expression.escapedText === h.expression.escapedText)
                    );

                  const newImplementsClauses = implementsClauses
                    ? factory.updateHeritageClause(implementsClauses, deduplicateHeritageClauses([...implementsClauses.types, ...interfaceToImplements]))
                    : factory.createHeritageClause(ts.SyntaxKind.ImplementsKeyword, [...interfaceToImplements]);

                  const heritageClauses: ts.HeritageClause[] = Array.from(node.heritageClauses ?? [])
                    .filter((h) => h.token !== ts.SyntaxKind.ImplementsKeyword)
                    .concat(newImplementsClauses);

                  const newModifiers = ([] as ts.ModifierLike[])
                    .concat(ts.getDecorators(node) || [])
                    .concat(ts.getModifiers(node) || []);

                  const hasSubscriptions = node.members.find((classElement) =>
                    ts.isPropertyDeclaration(classElement)
                  && ts.isIdentifier(classElement.name)
                  && classElement.name.escapedText.toString() === 'subscriptions'
                  );

                  /* eslint-disable indent */
                const propertiesToAdd = generateClassElementsFromString(`
                  @ViewChild('frame') private frame: ElementRef<HTMLIFrameElement>;
                  private bridge: IframeBridge;
                  ${!hasSubscriptions ? 'private readonly subscriptions: Subscription[] = [];' : ''}
                `);
                /* eslint-disable indent */

                const newNgAfterViewInit = getSimpleUpdatedMethod(node, factory, 'ngAfterViewInit', generateBlockStatementsFromString(`
                if (this.frame.nativeElement.contentDocument) {
                  this.frame.nativeElement.contentDocument.write(
                    generateIFrameContent(
                      '', // third-party-script-url
                      '' // third-party-html-headers-to-add
                    )
                  );
                  this.frame.nativeElement.contentDocument.close();
                }
                if (this.frame.nativeElement.contentWindow) {
                  this.bridge = new IframeBridge(window, this.frame.nativeElement);
                  this.subscriptions.push(
                    this.bridge.messages$.subscribe((message) => {
                      switch (message.action) {
                        // custom logic based on received message
                        default:
                          console.warn('Received unsupported action: ', message.action);
                      }
                    })
                  );
                }
              `));

                const newNgOnDestroy = getSimpleUpdatedMethod(node, factory, 'ngOnDestroy', generateBlockStatementsFromString(`
                  this.subscriptions.forEach((subscription) => subscription.unsubscribe());
                `));

                const newMembers = node.members
                  .filter((classElement) => !(
                    findMethodByName('ngAfterViewInit')(classElement)
                  || (!hasSubscriptions && findMethodByName('ngOnDestroy')(classElement))
                  ))
                  .concat(
                    propertiesToAdd,
                    newNgAfterViewInit,
                    ...(hasSubscriptions ? [] : [newNgOnDestroy])
                  )
                  .sort(sortClassElement);

                addCommentsOnClassProperties(
                  newMembers,
                  {
                    bridge: 'Iframe object template reference',
                    subscriptions: 'List of subscriptions to unsubscribe on destroy'
                  }
                );

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
            return ts.visitNode(rootNode, visit) as ts.SourceFile;
          },
          fixStringLiterals
        ]);

        const printer = ts.createPrinter({
          removeComments: false,
          newLine: ts.NewLineKind.LineFeed
        });

        tree.overwrite(options.path, printer.printFile(result.transformed[0]));
        return tree;
      }
    ]);

    const updateTemplateFile: Rule = () => {
      const templatePath = templateRelativePath && posix.join(dirname(options.path), templateRelativePath);
      if (templatePath && tree.exists(templatePath)) {
        tree.commitUpdate(
          tree
            .beginUpdate(templatePath)
            .insertLeft(0, '<iframe #frame src="about:blank" style="display: none"></iframe>\n')
        );
      }

      return tree;
    };

    return chain([
      updateComponentFile,
      updateTemplateFile,
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
          ngAddIframe(options)
        ]);
      }
    }
    throw e;
  }
  };
}
