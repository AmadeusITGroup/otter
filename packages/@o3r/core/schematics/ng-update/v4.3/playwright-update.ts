import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getProjectFromTree, readAngularJson, TYPES_DEFAULT_FOLDER } from '@o3r/schematics';
import * as commentJson from 'comment-json';

/**
 * Update application to setup playwright runners
 */
export function updatePlaywrightEnvironment(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const workspace = readAngularJson(tree);
    const projectName = Object.keys(workspace.projects)[0];
    const workspaceProject = getProjectFromTree(tree, null, 'application');
    if (!workspaceProject) {
      return tree;
    }

    const schematicsName = ['@o3r/testing:playwright-scenario', '@o3r/testing:playwright-sanity'] as const;
    schematicsName.forEach((schematicName) => {
      const path = TYPES_DEFAULT_FOLDER[schematicName].app;
      if (path) {
        workspaceProject.schematics![schematicName] = {
          path,
          ...(workspaceProject.schematics![schematicName] || {})
        };
      }
    });
    workspace.projects[projectName] = workspaceProject;
    tree.overwrite('/angular.json', commentJson.stringify(workspace, null, 2));
    return tree;
  };
}
