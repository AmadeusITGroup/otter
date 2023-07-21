import { apply, chain, MergeStrategy, mergeWith, renameTemplateFiles, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import { getProjectFromTree, getTemplateFolder } from '@o3r/schematics';

/**
 * Create the default Azure Pipeline configuration.
 *
 * @param options @see RuleFactory.options
 * @param options.projectName
 * @param rootPath @see RuleFactory.rootPath
 * @param options.enableStorybook
 */
export function createAzurePipeline(options: { projectName: string | null | undefined; enableStorybook: boolean }, rootPath: string): Rule {

  /**
   * Generate The Azure Pipeline configuration.
   *
   * @param tree
   * @param context
   */
  const generateAzurePipeline = (tree: Tree, context: SchematicContext) => {
    if (tree.exists('/azure-pipelines.yml')) {
      return tree;
    }
    const workspaceProject = getProjectFromTree(tree, options.projectName, 'application');
    if (!workspaceProject) {
      context.logger.warn(`The project "${options.projectName!}" is not an application, the pipeline generation will be skipped.`);
      return tree;
    }
    const templateSource = apply(url(getTemplateFolder(rootPath, __dirname)), [
      template({
        ...options
      }),
      renameTemplateFiles()
    ]);

    const rule = mergeWith(templateSource, MergeStrategy.AllowOverwriteConflict);
    return rule(tree, context);
  };

  /**
   * Indicate manually if the Azure Pipeline configuration should be generated.
   *
   * @param tree
   * @param context
   */
  const manualProcessNotification = (tree: Tree, context: SchematicContext) => {
    if (tree.exists('/azure-pipelines.yml')) {
      return tree;
    }
    const workspaceProject = getProjectFromTree(tree, options.projectName, 'application');
    if (!workspaceProject) {
      return tree;
    }
    context.logger.info('To be able to deploy your application to Deploy Service V2 provided by Amadeus, you need to manually process the following steps:');
    context.logger.info(`  - create the variable group "variables for ${options.projectName!}" containing the "DS_PDT_CLIENT_SECRET" and "DS_PDT_CLIENT_ID" variables"`);
    context.logger.info('  - contact support channels to create your application blueprint');

    return tree;
  };

  return chain([
    generateAzurePipeline,
    manualProcessNotification
  ]);
}
