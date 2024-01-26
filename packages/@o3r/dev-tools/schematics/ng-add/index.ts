import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

/**
 * Add Otter dev-tools to an Angular Project
 */
export function ngAdd(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.warn('@o3r/dev-tools package is deprecated and will no longer be updated as of v12.');
    return tree;
  };
}
