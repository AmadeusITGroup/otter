import {
  noop,
  type Rule,
  type SchematicContext,
  type Tree,
} from '@angular-devkit/schematics';
import {
  applyEsLintFix,
  createOtterSchematic,
  findFilesInTree,
} from '@o3r/schematics';

/**
 * In-repo {@link AbstractMessageConsumer} subclasses that used to auto-start in their constructor.
 * In v15 the constructor is removed, so the application must start them explicitly.
 */
const KNOWN_CONSUMERS = [
  'NavigationConsumerService',
  'ThemeConsumerService',
  'HistoryConsumerService',
  'ResizeConsumerService'
] as const;

/**
 * For every known consumer injected in the given file, append a `.start()` call to its `inject(<Consumer>)`
 * expression. Idempotent: an `inject(<Consumer>)` already followed by `.start(` is left untouched.
 * @param tree Schematic tree
 * @param filePath Path of the `app.config.ts` / `main.ts` file
 * @param context Schematic context for logging
 */
const appendStartToInjectedConsumers = (tree: Tree, filePath: string, context: SchematicContext): void => {
  const original = tree.readText(filePath);
  let updated = original;
  const started: string[] = [];

  for (const consumer of KNOWN_CONSUMERS) {
    // Match `inject(<Consumer>)` that is not already followed by `.start(`.
    const injectRegex = new RegExp(`inject\\(\\s*${consumer}\\s*\\)(?!\\s*\\.start\\b)`, 'g');
    if (injectRegex.test(updated)) {
      updated = updated.replace(injectRegex, `inject(${consumer}).start()`);
      started.push(consumer);
    }
  }

  if (updated !== original) {
    tree.overwrite(filePath, updated);
    context.logger.info(`[ama-mfe ng-update] Added explicit ".start()" call for ${started.join(', ')} in ${filePath}.`);
  }
};

/**
 * Migration to v14.5.0 of `@ama-mfe/ng-utils`.
 *
 * The consumers no longer auto-start in their constructor. This migration scans the
 * application configuration files (`app.config.ts` / `main.ts`) and, for every known consumer already injected there,
 * appends an explicit `.start()` call so the consumer keeps being started.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- version contained in the function name
function updateV14_5Fn(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const files = findFilesInTree(
      tree.getDir('/'),
      (filePath) => /\b(?:app\.config|main)\.ts$/.test(filePath) && !/\bdist\b/.test(filePath)
    );
    for (const file of files) {
      appendStartToInjectedConsumers(tree, file.path, context);
    }
    return applyEsLintFix() ?? noop();
  };
}

/**
 * Migration of `@ama-mfe/ng-utils` to v14.5.0.
 *
 * Appends explicit `.start()` calls for the in-repo consumers that no longer auto-start.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- version contained in the function name
export const updateV14_5 = createOtterSchematic(updateV14_5Fn);
