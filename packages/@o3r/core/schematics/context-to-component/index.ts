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
import {
  applyEsLintFix,
  generateImplementsExpressionWithTypeArguments,
  getO3rComponentInfo,
  isO3rClassComponent
} from '@o3r/schematics';
import { insertImport } from '@schematics/angular/utility/ast-utils';
import { applyToUpdateRecorder, Change } from '@schematics/angular/utility/change';
import { basename, dirname, resolve } from 'node:path';
import * as ts from 'typescript';
import type { NgAddConfigSchematicsSchema } from './schema';

const checkContext = (componentPath: string, tree: Tree) => {
  const files = [
    resolve(dirname(componentPath), `./${basename(componentPath, '.component.ts')}.context.ts`)
  ];
  if (files.some((file) => tree.exists(file))) {
    throw new Error(`Unable to add context to this component because it already has at least one of these files: ${files.join(', ')}.`);
  }
};


/**
 * Add context to an existing component
 *
 * @param options
 */
export function ngAddContext(options: NgAddConfigSchematicsSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const componentPath = options.path;
    const { name } = getO3rComponentInfo(tree, componentPath);

    checkContext(componentPath, tree);

    const properties = {
      componentContext: name.concat('Context'),
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
          from: `./${properties.name}.context`,
          importNames: [
            properties.componentContext
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
            const interfaceToImplements = generateImplementsExpressionWithTypeArguments(properties.componentContext);

            const newImplementsClauses = implementsClauses
              ? factory.updateHeritageClause(implementsClauses, [...implementsClauses.types, ...interfaceToImplements])
              : factory.createHeritageClause(ts.SyntaxKind.ImplementsKeyword, [...interfaceToImplements]);

            const heritageClauses: ts.HeritageClause[] = [...(node.heritageClauses || [])]
              .filter((h: ts.HeritageClause) => h.token !== ts.SyntaxKind.ImplementsKeyword)
              .concat(newImplementsClauses);

            const newModifiers = ([] as ts.ModifierLike[])
              .concat(ts.getDecorators(node) || [])
              .concat(ts.getModifiers(node) || []);

            return factory.updateClassDeclaration(
              node,
              newModifiers,
              node.name,
              node.typeParameters,
              heritageClauses,
              node.members
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
