import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as commentJson from 'comment-json';
import { getProjectFromTree, readAngularJson, readPackageJson } from '../../../../utility/loaders';

/**
 * Update configuration for the prefetch script
 *
 * @param rootPath @see RuleFactory.rootPath
 */
export function updatePrefetchBuilderConfiguration(): Rule {
  return (tree: Tree, _context: SchematicContext) => {

    const workspaceProject = getProjectFromTree(tree);
    const workspace = readAngularJson(tree);
    const packageJson = readPackageJson(tree, workspaceProject);

    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    const projectName = workspace.defaultProject || Object.keys(workspace.projects)[0];
    packageJson.scripts['generate:prefetch'] = `ng run ${projectName}:generate-prefetch`;
    tree.overwrite(`${workspaceProject.root}/package.json`, JSON.stringify(packageJson, null, 2));

    if (!workspaceProject.architect) {
      workspaceProject.architect = {};
    }

    workspaceProject.architect['generate-prefetch'] = {
      builder: '@otter/ng-tools:prefetch'
    };

    workspace.projects[projectName] = workspaceProject;
    tree.overwrite('/angular.json', commentJson.stringify(workspace, null, 2));
    return tree;
  };
}
