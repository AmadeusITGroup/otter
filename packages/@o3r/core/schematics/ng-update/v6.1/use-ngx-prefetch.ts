import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getProjectFromTree, readAngularJson } from '@o3r/schematics';
import { addPackageJsonDependency, NodeDependencyType } from '@schematics/angular/utility/dependencies';
import * as commentJson from 'comment-json';

/**
 * Add the mandatory targetBuild property for the prefetch builder
 */
export function useNgxPrefetch(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const workspace = readAngularJson(tree);
    const projectName = workspace.defaultProject || Object.keys(workspace.projects)[0];
    const workspaceProject = getProjectFromTree(tree);
    if (workspaceProject.projectType !== 'application') {
      // no update for libraries
      return tree;
    } else if (workspaceProject.architect) {
      for (const builder of Object.keys(workspaceProject.architect)) {
        const builderObj = workspaceProject.architect[builder];
        if (builderObj && builderObj.builder === '@otter/ng-tools:prefetch') {
          workspaceProject.architect[builder].builder = '@o3r/ngx-prefetch:run';
        }
      }
      workspace.projects[projectName] = workspaceProject;
      tree.overwrite('/angular.json', commentJson.stringify(workspace, null, 2));

      addPackageJsonDependency(tree, {name: '@o3r/ngx-prefetch', version: '~13.0.3', type: NodeDependencyType.Dev, overwrite: false});

      return tree;
    }
  };
}
