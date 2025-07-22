import type {
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';

/**
 * Update VsCode recommendations for the current project
 * @param recommendations list of recommendations
 */
export const addVsCodeRecommendations = (recommendations: string[]): Rule => {
  const extensionFile = '/.vscode/extensions.json';

  return (tree: Tree, context: SchematicContext) => {
    if (tree.exists(extensionFile)) {
      const extensions = tree.readJson(extensionFile) as { recommendations: string[] };
      extensions.recommendations = Array.from(new Set([...(extensions.recommendations || []), ...recommendations]));
      tree.overwrite(extensionFile, JSON.stringify(extensions, null, 2));
      context.logger.debug(`Updated ${extensionFile} with recommendations: ${recommendations.join(', ')}`);
    } else {
      tree.create(extensionFile, JSON.stringify({ recommendations }, null, 2));
      context.logger.debug(`Create ${extensionFile} with recommendations: ${recommendations.join(', ')}`);
    }
    return tree;
  };
};
