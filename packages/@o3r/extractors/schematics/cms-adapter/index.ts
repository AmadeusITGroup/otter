import { strings } from '@angular-devkit/core';
import { apply, chain, MergeStrategy, mergeWith, move, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import { getProjectFromTree, getTemplateFolder, ignorePatterns } from '@o3r/schematics';
import * as path from 'node:path';

/**
 * Update CMS adapter tools
 *
 * @param options @see RuleFactory.options
 * @param options.projectName
 * @param rootPath @see RuleFactory.rootPath
 */
export function updateCmsAdapter(options: { projectName: string | null }, rootPath: string): Rule {

  /**
   * Generate Tsconfig for cms extracters
   *
   * @param tree
   * @param context
   */
  const generateTsConfig = (tree: Tree, context: SchematicContext) => {

    const workspaceProject = getProjectFromTree(tree, options.projectName);
    const projectRoot = path.posix.join('/', workspaceProject?.root || '');
    const pathTsconfigCms = path.posix.join(projectRoot, 'tsconfig.cms.json');
    if (tree.exists(pathTsconfigCms)) {
      return tree;
    }
    const buildTsConfig: string =
      workspaceProject && workspaceProject.architect && workspaceProject.architect.build && workspaceProject.architect.build.options && workspaceProject.architect.build.options.tsConfig
      || './tsconfig';

    const templateSource = apply(url(getTemplateFolder(rootPath, __dirname)), [
      template({
        ...strings,
        buildTsConfig: buildTsConfig.startsWith('.') ? buildTsConfig : `./${buildTsConfig}`,
        sourceRoot: workspaceProject?.sourceRoot || 'src'
      }),
      move(projectRoot)
    ]);

    const rule = mergeWith(templateSource, MergeStrategy.AllowOverwriteConflict);
    return rule(tree, context);
  };

  const ignoreMetadataFiles = (tree: Tree, _context: SchematicContext) => {
    return ignorePatterns(tree, [{ description: 'CMS metadata files', patterns: ['/*.metadata.json'] }]);
  };

  return chain([
    generateTsConfig,
    ignoreMetadataFiles
  ]);
}
