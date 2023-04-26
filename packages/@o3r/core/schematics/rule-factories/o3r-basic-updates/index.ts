import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getProjectFromTree, ngAddPackages, readAngularJson, readPackageJson } from '@o3r/schematics';

/**
 * Package.json updates to include o3r ng update script
 * Install of dev-tools and schematics packages
 *
 * @param pName project name
 * @param o3rCoreVersion
 */
export function o3rBasicUpdates(pName: string | null, o3rCoreVersion?: string): Rule {

  const updatePackageJson = (tree: Tree, _context: SchematicContext) => {
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

  return chain([
    updatePackageJson,
    ngAddPackages(['@o3r/dev-tools', '@o3r/schematics'], { skipConfirmation: true, version: o3rCoreVersion, parentPackageInfo: '@o3r/core - basic updates', dependencyType: 'dev'})
  ]);

}
