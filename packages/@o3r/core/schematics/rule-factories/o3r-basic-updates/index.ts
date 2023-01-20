import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getProjectFromTree, readAngularJson, readPackageJson } from '@o3r/schematics';

/**
 * Package.json updates to include o3r ng update script
 *
 * @param pName project name
 */
export function o3rBasicUpdates(pName: string | null): Rule {

  return (tree: Tree, _context: SchematicContext) => {
    const workspace = readAngularJson(tree);
    const projectName = pName || workspace.defaultProject || Object.keys(workspace.projects)[0];
    const workspaceProject = getProjectFromTree(tree, projectName || undefined);
    const packageJson = readPackageJson(tree, workspaceProject);

    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    packageJson.scripts['update:otter'] = 'ng update @o3r/core';

    tree.overwrite(`${workspaceProject.root}/package.json`, JSON.stringify(packageJson, null, 2));
    return tree;
  };

}
