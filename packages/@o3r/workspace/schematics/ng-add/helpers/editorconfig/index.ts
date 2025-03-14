import {
  apply,
  MergeStrategy,
  mergeWith,
  renameTemplateFiles,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import {
  getPackageManager,
} from '@o3r/schematics';

/**
 * Add editorconfig configuration to Otter project
 */
export function generateEditorConfig(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (tree.exists('.editorconfig')) {
      context.logger.info('A file .editorconfig already exist, a new one won\'t be generated.');
      return tree;
    }
    const templateSource = apply(url('./helpers/editorconfig/templates'), [
      template({
        dot: '.',
        packageManager: getPackageManager()
      }),
      renameTemplateFiles()
    ]);

    const rule = mergeWith(templateSource, MergeStrategy.Overwrite);
    return rule(tree, context);
  };
}
