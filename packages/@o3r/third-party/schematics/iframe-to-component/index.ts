import {
  dirname,
  posix,
} from 'node:path';
import {
  chain,
  externalSchematic,
  noop,
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import {
  addCommentsOnClassProperties,
  addImportsRule,
  applyEsLintFix,
  askConfirmationToConvertComponent,
  createOtterSchematic,
  findMethodByName,
  fixStringLiterals,
  generateBlockStatementsFromString,
  generateClassElementsFromString,
  generateImplementsExpressionWithTypeArguments,
  getO3rComponentInfoOrThrowIfNotFound,
  getSimpleUpdatedMethod,
  NoOtterComponent,
  O3rCliError,
  sortClassElement,
} from '@o3r/schematics';
import * as ts from 'typescript';
import type {
  NgAddIframeSchematicsSchema,
} from './schema';

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
  const classStatement = sourceFile.statements.find((statement) => ts.isClassDeclaration(statement));
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
 * @param options
 */
export function ngAddIframeFn(options: NgAddIframeSchematicsSchema): Rule {
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
              'DestroyRef',
              'ElementRef',
              'inject',
              'viewChild'
            ]
          },
          {
            from: '@angular/core/rxjs-interop',
            importNames: [
              'takeUntilDestroyed'
            ]
          },
          {
            from: '@o3r/third-party',
            importNames: [
              'generateIFrameContent',
              'IframeBridge'
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
                  const interfaceToImplements = generateImplementsExpressionWithTypeArguments('AfterViewInit');

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

                  const propertiesToAdd = generateClassElementsFromString(`
  private frame = viewChild.required<ElementRef<HTMLIFrameElement>>('frame');
  private bridge?: IframeBridge;
  private readonly destroyRef = inject(DestroyRef);
                  `);

                  const newNgAfterViewInit = getSimpleUpdatedMethod(node, factory, 'ngAfterViewInit', generateBlockStatementsFromString(`
    const nativeElem = this.frame().nativeElement;
    if (nativeElem.contentDocument) {
      nativeElem.contentDocument.write(
        generateIFrameContent(
          '', // third-party-script-url
          '' // third-party-html-headers-to-add
        )
      );
      nativeElem.contentDocument.close();
    }
    if (nativeElem.contentWindow) {
      this.bridge = new IframeBridge(window, nativeElem);
      this.bridge.messages$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((message) => {
        switch (message.action) {
          // custom logic based on received message
          default:
            console.warn('Received unsupported action: ', message.action);
        }
      });
    }
                `));

                  const newMembers = node.members
                    .filter((classElement) => !findMethodByName('ngAfterViewInit')(classElement))
                    .concat(
                      propertiesToAdd,
                      newNgAfterViewInit
                    )
                    .sort(sortClassElement);

                  addCommentsOnClassProperties(
                    newMembers,
                    {
                      bridge: 'Iframe object template reference'
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

          tree.overwrite(options.path, printer.printFile(result.transformed[0] as ts.SourceFile));
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
            ngAddIframeFn(options)
          ]);
        }
      }
      throw e;
    }
  };
}

/**
 * Add iframe to an existing component
 * @param options
 */
export const ngAddIframe = createOtterSchematic(ngAddIframeFn);
