import { chain, noop, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import {
  applyEsLintFix,
  createSchematicWithMetricsIfInstalled,
  findMethodByName,
  fixStringLiterals,
  generateBlockStatementsFromString,
  generateClassElementsFromString,
  generateImplementsExpressionWithTypeArguments,
  getLibraryNameFromPath,
  getSimpleUpdatedMethod,
  O3rCliError,
  sortClassElement
} from '@o3r/schematics';
import { insertImport } from '@schematics/angular/utility/ast-utils';
import { applyToUpdateRecorder, Change } from '@schematics/angular/utility/change';
import * as ts from 'typescript';
import { NgGenerateRulesEngineToComponentSchematicsSchema } from './schema';

const rulesEngineProperties = ['rulesEngineService'];
const checkRulesEngine = (componentPath: string | null | undefined) => (tree: Tree) => {
  if (!componentPath || !tree.exists(componentPath)) {
    throw new O3rCliError(`Unable to add rules-engine: component "${componentPath || ''}" does not exist`);
  }
  const componentSourceFile = ts.createSourceFile(
    componentPath,
    tree.readText(componentPath),
    ts.ScriptTarget.ES2020,
    true
  );
  const o3rClassDeclaration = componentSourceFile.statements.find((statement): statement is ts.ClassDeclaration =>
    ts.isClassDeclaration(statement)
  )!;
  const constructorDeclaration = o3rClassDeclaration.members.find((classElement): classElement is ts.ConstructorDeclaration => ts.isConstructorDeclaration(classElement));
  const constructorPropertiesModifiers = [ts.SyntaxKind.PrivateKeyword, ts.SyntaxKind.ProtectedKeyword, ts.SyntaxKind.PublicKeyword];
  if (o3rClassDeclaration.members.some((classElement) =>
    ts.isPropertyDeclaration(classElement)
    && ts.isIdentifier(classElement.name)
    && rulesEngineProperties.includes(classElement.name.escapedText.toString())
  ) || constructorDeclaration?.parameters?.some((parameterElement) =>
    parameterElement.modifiers?.some((mod) => constructorPropertiesModifiers.includes(mod.kind))
    && rulesEngineProperties.includes((parameterElement.name as ts.Identifier).escapedText.toString())
  )) {
    throw new O3rCliError(`Unable to add rules-engine: component "${componentPath}" already has at least one of these properties: ${rulesEngineProperties.join(', ')}.`);
  }
};

/**
 * Generate the code to enable rules-engine on a component
 * @param options
 */
function ngGenerateRulesEngineToComponentFn(options: NgGenerateRulesEngineToComponentSchematicsSchema): Rule {

  const generateFiles: Rule = (tree: Tree, _context: SchematicContext) => {
    const componentPath = options.path!;
    const projectName = options.projectName || getLibraryNameFromPath(componentPath) || '';
    const imports = [
      {
        from: '@angular/core',
        importNames: ['inject', 'OnInit', 'OnDestroy']
      },
      {
        from: '@o3r/core',
        importNames: ['computeItemIdentifier']
      },
      {
        from: '@o3r/rules-engine',
        importNames: ['RulesEngineRunnerService']
      }
    ];
    let sourceFile = ts.createSourceFile(
      componentPath,
      tree.readText(componentPath),
      ts.ScriptTarget.ES2020,
      true
    );
    const recorder = tree.beginUpdate(componentPath);
    const changes = imports.reduce((acc: Change[], { importNames, from }) => acc.concat(
      importNames.map((importName) =>
        insertImport(sourceFile, componentPath, importName, from)
      )
    ), []);
    applyToUpdateRecorder(recorder, changes);
    tree.commitUpdate(recorder);

    sourceFile = ts.createSourceFile(
      componentPath,
      tree.readText(componentPath),
      ts.ScriptTarget.ES2020,
      true
    );
    const result = ts.transform(sourceFile, [
      (ctx) => (rootNode: ts.Node) => {
        const { factory } = ctx;
        const visit = (node: ts.Node): ts.Node => {
          if (ts.isClassDeclaration(node)) {
            const implementsClauses = node.heritageClauses?.find((heritageClause) => heritageClause.token === ts.SyntaxKind.ImplementsKeyword);
            const interfaceToImplements = generateImplementsExpressionWithTypeArguments('OnInit, OnDestroy');

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
              private readonly componentName = computeItemIdentifier('${node.name?.escapedText as string}', '${projectName}');
              private readonly rulesEngineService = inject(RulesEngineRunnerService, {optional: true});
            `);

            const newNgOnInit = getSimpleUpdatedMethod(node, factory, 'ngOnInit', generateBlockStatementsFromString(`
              if (this.rulesEngineService) {
                this.rulesEngineService.enableRuleSetFor(this.componentName);
              }
            `));
            const newNgOnDestroy = getSimpleUpdatedMethod(node, factory, 'ngOnDestroy', generateBlockStatementsFromString(`
              if (this.rulesEngineService) {
                this.rulesEngineService.disableRuleSetFor(this.componentName);
              }
            `));
            const newMembers = node.members
              .filter((classElement) => !(
                findMethodByName('ngOnInit')(classElement) || findMethodByName('ngOnDestroy')(classElement)
              ))
              .concat(propertiesToAdd, newNgOnInit, newNgOnDestroy)
              .sort(sortClassElement);

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

    tree.overwrite(componentPath, printer.printFile(result.transformed[0]));
    return tree;
  };

  return chain([
    checkRulesEngine(options.path),
    generateFiles,
    options.skipLinter ? noop() : applyEsLintFix()
  ]);
}


/**
 * Generate the code to enable rules-engine on a component
 * @param options
 */
export const ngGenerateRulesEngineToComponent = createSchematicWithMetricsIfInstalled(ngGenerateRulesEngineToComponentFn);
