import * as path from 'node:path';
import {
  strings
} from '@angular-devkit/core';
import {
  apply,
  chain,
  MergeStrategy,
  mergeWith,
  move,
  noop,
  renameTemplateFiles,
  Rule,
  SchematicContext,
  template,
  Tree,
  url
} from '@angular-devkit/schematics';
import {
  getTemplateFolder,
  getWorkspaceConfig,
  ignorePatterns
} from '@o3r/schematics';

/**
 * Update CMS adapter tools
 * @param options @see RuleFactory.options
 * @param options.projectName
 * @param rootPath @see RuleFactory.rootPath
 */
export function updateCmsAdapter(options: { projectName?: string | undefined }, rootPath: string): Rule {
  if (!options.projectName) {
    return noop;
  }

  /**
   * Generate Tsconfig for cms extracters
   * @param tree
   * @param context
   */
  const generateTsConfig = (tree: Tree, context: SchematicContext) => {
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    const projectRoot = path.posix.join('/', workspaceProject?.root || '');
    const pathTsconfigCms = path.posix.join(projectRoot, 'tsconfig.cms.json');
    if (tree.exists(pathTsconfigCms)) {
      return tree;
    }
    const buildTsConfig: string = workspaceProject && workspaceProject.architect && workspaceProject.architect.build && workspaceProject.architect.build.options && workspaceProject.architect.build.options.tsConfig
      || './tsconfig';

    const templateSource = apply(url(getTemplateFolder(rootPath, __dirname)), [
      template({
        ...strings,
        buildTsConfig: buildTsConfig.startsWith('.') ? buildTsConfig : `./${buildTsConfig}`,
        sourceRoot: workspaceProject?.sourceRoot || 'src'
      }),
      move(projectRoot),
      renameTemplateFiles()
    ]);

    const rule = mergeWith(templateSource, MergeStrategy.AllowOverwriteConflict);
    return rule(tree, context);
  };

  const ignoreMetadataFiles = (tree: Tree, _context: SchematicContext) => {
    return ignorePatterns(tree, [{ description: 'CMS metadata files', patterns: ['/*.metadata.json'] }]);
  };

  /**
   * Add aggregate-migration-scripts builder into the angular.json
   * @param tree
   * @param context
   */
  const editAngularJson = (tree: Tree, context: SchematicContext) => {
    const workspace = getWorkspaceConfig(tree);
    const workspaceProject = options.projectName ? workspace?.projects[options.projectName] : undefined;

    if (!workspace || !workspaceProject) {
      context.logger.error('No project detected, the extractors builders will not be added');
      return tree;
    }

    if (!workspaceProject.architect) {
      workspaceProject.architect = {};
    }

    workspaceProject.architect['aggregate-migration-scripts'] ||= {
      builder: '@o3r/extractors:aggregate-migration-scripts',
      options: {
        migrationDataPath: 'migration-scripts/src/MIGRATION-*.json',
        outputDirectory: 'migration-scripts/dist'
      }
    };

    workspace.projects[options.projectName!] = workspaceProject;
    tree.overwrite('/angular.json', JSON.stringify(workspace, null, 2));
    return tree;
  };

  return chain([
    generateTsConfig,
    ignoreMetadataFiles,
    editAngularJson
  ]);
}
