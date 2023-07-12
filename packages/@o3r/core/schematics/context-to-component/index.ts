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
  addImportsRule,
  addInterfaceToClassTransformerFactory,
  applyEsLintFix,
  getO3rComponentInfoOrThrowIfNotFound,
  isO3rClassComponent
} from '@o3r/schematics';
import { basename, dirname, posix } from 'node:path';
import * as ts from 'typescript';
import type { NgAddConfigSchematicsSchema } from './schema';

const checkContext = (componentPath: string, tree: Tree) => {
  const files = [
    posix.join(dirname(componentPath), `${basename(componentPath, '.component.ts')}.context.ts`)
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
    const { name } = getO3rComponentInfoOrThrowIfNotFound(tree, componentPath);

    checkContext(componentPath, tree);

    const properties = {
      componentContext: name.concat('Context'),
      name: basename(componentPath, '.component.ts')
    };

    const createConfigFilesRule: Rule = mergeWith(apply(url('./templates'), [
      template(properties),
      renameTemplateFiles(),
      move(dirname(componentPath))
    ]), MergeStrategy.Overwrite);

    const updateComponentRule: Rule = chain([
      addImportsRule(componentPath, [
        {
          from: `./${properties.name}.context`,
          importNames: [
            properties.componentContext
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
          addInterfaceToClassTransformerFactory(properties.componentContext, isO3rClassComponent)
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
      updateComponentRule,
      options.skipLinter ? noop() : applyEsLintFix()
    ])(tree, context);
  };
}
