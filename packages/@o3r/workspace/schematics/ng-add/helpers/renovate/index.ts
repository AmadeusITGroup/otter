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
  getTemplateFolder,
} from '@o3r/schematics';

/**
 * Add renovate configuration to Otter application
 * @param rootPath @see RuleFactory.rootPath
 */
export function generateRenovateConfig(rootPath: string): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (tree.exists('.renovaterc.json')) {
      return tree;
    }
    const templateSource = apply(url(getTemplateFolder(rootPath, __dirname)), [
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
