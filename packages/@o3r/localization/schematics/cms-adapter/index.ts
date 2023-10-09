import { chain, noop, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getPackageManagerRunner, getWorkspaceConfig, readPackageJson } from '@o3r/schematics';
import * as path from 'node:path';


/**
 * Update CMS adapter tools
 * @param options @see RuleFactory.options
 * @param options.projectName
 * @param rootPath @see RuleFactory.rootPath
 */
export function updateCmsAdapter(options: { projectName?: string | undefined }): Rule {
  if (!options.projectName) {
    return noop;
  }

  /**
   * Add cms extractors builder into the angular.json
   * @param tree
   * @param _context
   * @param context
   */
  const editAngularJson = (tree: Tree, context: SchematicContext) => {
    const workspace = getWorkspaceConfig(tree);
    const workspaceProject = options.projectName ? workspace?.projects[options.projectName] : undefined;

    if (!workspace || !workspaceProject) {
      context.logger.error('No project detected, the extractors will not be added');
      return tree;
    }

    if (!workspaceProject.architect) {
      workspaceProject.architect = {};
    }

    workspaceProject.architect['extract-translations'] ||= {
      builder: '@o3r/localization:extractor',
      options: {
        tsConfig: path.join(workspaceProject?.root || '', 'tsconfig.cms.json'),
        libraries: []
      }
    };

    workspace.projects[options.projectName!] = workspaceProject;
    tree.overwrite('/angular.json', JSON.stringify(workspace, null, 2));
    return tree;
  };

  /**
   * Add cms extractors scripts into the package.json
   * @param tree
   * @param _context
   * @param context
   */
  const addExtractorsScripts = (tree: Tree, context: SchematicContext) => {
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;

    if (!workspaceProject) {
      context.logger.error('No package detected, the extractor scripts will not be added');
      return tree;
    }

    const packageJson = readPackageJson(tree, workspaceProject);
    const packageManagerRunner = getPackageManagerRunner(getWorkspaceConfig(tree));
    packageJson.scripts ||= {};
    packageJson.scripts['cms-adapters:localizations'] ||= `ng run ${options.projectName!}:extract-translations`;
    packageJson.scripts['cms-adapters:metadata'] = Object.keys(packageJson.scripts)
      .filter((s) => /^cms-adapters:(?!metadata$)/.test(s))
      .map((s) => `${packageManagerRunner} ${s}`)
      .join(' && ');

    tree.overwrite(`${workspaceProject.root}/package.json`, JSON.stringify(packageJson, null, 2));
    return tree;
  };

  return chain([
    addExtractorsScripts,
    editAngularJson
  ]);
}
