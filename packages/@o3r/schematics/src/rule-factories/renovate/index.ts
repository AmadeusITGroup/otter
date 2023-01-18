import { apply, MergeStrategy, mergeWith, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import { getTemplateFolder } from '../../utility/loaders';

/**
 * Add renovate configuration to Otter application
 *
 * @param rootPath @see RuleFactory.rootPath
 */
export function generateRenovateConfig(rootPath: string): Rule {
  return (tree: Tree, context: SchematicContext) => {

    const templateSource = apply(url(getTemplateFolder(rootPath, __dirname)), [
      template({
        dot: '.'
      })
    ]);

    const rule = mergeWith(templateSource, MergeStrategy.Overwrite);
    return rule(tree, context);
  };
}
