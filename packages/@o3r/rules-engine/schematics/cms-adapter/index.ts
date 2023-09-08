import { chain, noop, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getPackageManagerRunner, getProjectFromTree, getWorkspaceConfig, readAngularJson, readPackageJson } from '@o3r/schematics';
import * as path from 'node:path';


/**
 * Update CMS adapter tools
 *
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
   *
   * @param tree
   * @param _context
   * @param context
   */
  const editAngularJson = (tree: Tree, context: SchematicContext) => {
    const workspace = readAngularJson(tree);
    const workspaceProject = getProjectFromTree(tree, options.projectName);

    if (!workspaceProject) {
      context.logger.error('No project detected, the extractors will not be added');
      return tree;
    }

    if (!workspaceProject.architect) {
      workspaceProject.architect = {};
    }

    workspaceProject.architect['extract-rules-engine'] ||= {
      builder: '@o3r/rules-engine:extractor',
      options: {
        tsConfig: path.join(workspaceProject?.root || '', 'tsconfig.cms.json'),
        libraries: []
      }
    };

    const { name, ...newProject } = workspaceProject;
    workspace.projects[name] = newProject;
    tree.overwrite('/angular.json', JSON.stringify(workspace, null, 2));
    return tree;
  };

  /**
   * Add cms extractors scripts into the package.json
   *
   * @param tree
   * @param _context
   * @param context
   */
  const addExtractorsScripts = (tree: Tree, context: SchematicContext) => {
    const workspaceProject = getProjectFromTree(tree, options.projectName);

    if (!workspaceProject) {
      context.logger.error('No package detected, the extractor scripts will not be added');
      return tree;
    }

    const packageJson = readPackageJson(tree, workspaceProject);
    const packageManagerRunner = getPackageManagerRunner(getWorkspaceConfig(tree));
    packageJson.scripts ||= {};
    packageJson.scripts['cms-adapters:rules-engine'] ||= `ng run ${options.projectName!}:extract-rules-engine`;
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
