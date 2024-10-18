import type {
  Rule,
  SchematicContext,
  Tree
} from '@angular-devkit/schematics';

/**
 * Update Otter dev-tools in an Angular Project
 */
export function ngUpdate(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.warn('@o3r/dev-tools package is deprecated and will no longer be updated as of v12.');
    return tree;
  };
}
