import {
  apply,
  chain,
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
  addImportsRule,
  addInterfaceToClassTransformerFactory,
  applyEsLintFix,
  askConfirmationToConvertComponent,
  createSchematicWithMetricsIfInstalled,
  getO3rComponentInfoOrThrowIfNotFound,
  isO3rClassComponent,
  NoOtterComponent,
  O3rCliError
} from '@o3r/schematics';
import { basename, dirname, posix } from 'node:path';
import * as ts from 'typescript';
import type { NgAddConfigSchematicsSchema } from './schema';

const checkContext = (componentPath: string, tree: Tree) => {
  const files = [
    posix.join(dirname(componentPath), `${basename(componentPath, '.component.ts')}.context.ts`)
  ];
  if (files.some((file) => tree.exists(file))) {
    throw new O3rCliError(`Unable to add context to this component because it already has at least one of these files: ${files.join(', ')}.`);
  }
};


/**
 * Add context to an existing component
 * @param options
 */
export function ngAddContextFn(options: NgAddConfigSchematicsSchema): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const componentPath = options.path;
    try {
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
      ]);
    } catch (e) {
      if (e instanceof NoOtterComponent && context.interactive) {
        const shouldConvertComponent = await askConfirmationToConvertComponent();
        if (shouldConvertComponent) {
          return chain([
            schematic('convert-component', {
              path: options.path
            }),
            ngAddContextFn(options)
          ]);
        }
      }
      throw e;
    }
  };
}

export const ngAddContext = createSchematicWithMetricsIfInstalled(ngAddContextFn);
