import { strings } from '@angular-devkit/core';
import { apply, chain, filter, MergeStrategy, mergeWith, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import { getPackageManagerRunner, getProjectFromTree, getTemplateFolder, ignorePatterns, readAngularJson, readPackageJson } from '@o3r/schematics';
import * as commentJson from 'comment-json';


/**
 * Update CMS adapter tools
 *
 * @param options @see RuleFactory.options
 * @param options.projectName
 * @param rootPath @see RuleFactory.rootPath
 */
export function updateCmsAdapter(options: { projectName: string | null | undefined }, rootPath: string): Rule {

  /**
   * Generate Tsconfig for cms extracters
   *
   * @param tree
   * @param context
   */
  const generateTsConfig = (tree: Tree, context: SchematicContext) => {
    if (tree.exists('/tsconfig.cms.json')) {
      return tree;
    }
    const workspaceProject = getProjectFromTree(tree, null);
    const buildTsConfig: string =
      workspaceProject && workspaceProject.architect && workspaceProject.architect.build && workspaceProject.architect.build.options && workspaceProject.architect.build.options.tsConfig
      || './tsconfig';

    const templateSource = apply(url(getTemplateFolder(rootPath, __dirname)), [
      template({
        ...strings,
        buildTsConfig: buildTsConfig.startsWith('.') ? buildTsConfig : `./${buildTsConfig}`,
        sourceRoot: workspaceProject?.sourceRoot || 'src'
      }),
      // TODO* workaround for issue https://github.com/angular/angular-cli/issues/11337
      filter((fileEntry: string) => !tree.exists(fileEntry))
    ]);

    const rule = mergeWith(templateSource, MergeStrategy.AllowOverwriteConflict);
    return rule(tree, context);
  };

  /**
   * Add cms extracters builder into the angular.json
   *
   * @param tree
   * @param _context
   * @param context
   */
  const editAngularJson = (tree: Tree, context: SchematicContext) => {
    const workspace = readAngularJson(tree);
    const workspaceProject = getProjectFromTree(tree, null);

    if (!workspaceProject) {
      context.logger.warn('No project detected, the extractors will not be added');
      return tree;
    }

    if (!workspaceProject.architect) {
      workspaceProject.architect = {};
    }

    workspaceProject.architect['extract-translations'] ||= {
      builder: '@o3r/localization:extractor',
      options: {
        tsConfig: './tsconfig.cms.json',
        libraries: []
      }
    };

    workspaceProject.architect['extract-components'] ||= {
      builder: '@o3r/components:extractor',
      options: {
        tsConfig: './tsconfig.cms.json',
        libraries: []
      }
    };

    workspaceProject.architect['extract-style'] ||= {
      builder: '@o3r/styling:extractor',
      options: {
        filePatterns: [
          'src/**/*.scss'
        ],
        outputFile: './style.metadata.json'
      }
    };

    const { name, ...newProject } = workspaceProject;
    workspace.projects[name] = newProject;
    tree.overwrite('/angular.json', commentJson.stringify(workspace, null, 2));
    return tree;
  };

  /**
   * Add cms extracters scripts into the package.json
   *
   * @param tree
   * @param _context
   * @param context
   */
  const addExtractersScripts = (tree: Tree, context: SchematicContext) => {
    const workspaceProject = getProjectFromTree(tree, null);

    if (!workspaceProject) {
      context.logger.error('No package detected, the extractor scripts will not be added');
      return tree;
    }

    const packageJson = readPackageJson(tree, workspaceProject);
    const packageManagerRunner = getPackageManagerRunner();
    packageJson.scripts ||= {};
    packageJson.scripts['cms-adapters:metadata'] ||=
      `${packageManagerRunner} cms-adapters:components && ${packageManagerRunner} cms-adapters:localizations && ${packageManagerRunner} cms-adapters:style`;
    packageJson.scripts['cms-adapters:components'] ||= `ng run ${options.projectName!}:extract-components`;
    packageJson.scripts['cms-adapters:localizations'] ||= `ng run ${options.projectName!}:extract-translations`;
    packageJson.scripts['cms-adapters:style'] ||= `ng run ${options.projectName!}:extract-style`;

    tree.overwrite(`${workspaceProject.root}/package.json`, JSON.stringify(packageJson, null, 2));
    return tree;
  };

  // Ignore generated CMS metadata
  const ignoreMetadataFiles = (tree: Tree, _context: SchematicContext) => {
    return ignorePatterns(tree, [{ description: 'CMS metadata files', patterns: ['/*.metadata.json'] }]);
  };

  return chain([
    generateTsConfig,
    addExtractersScripts,
    editAngularJson,
    ignoreMetadataFiles
  ]);
}
