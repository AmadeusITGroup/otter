import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { WorkspaceProject } from '@o3r/schematics';
import { getWorkspaceConfig, readPackageJson } from '@o3r/schematics';
import type { PackageJson } from 'type-fest';

/**
 * Package.json updates to include o3r ng update script
 * @param pName project name
 * @param o3rCoreVersion
 * @param _o3rCoreVersion
 * @param projectType
 */
export function o3rBasicUpdates(pName: string | null | undefined, _o3rCoreVersion?: string, projectType?: WorkspaceProject['projectType']): Rule {

  const ngUpdateScript = (tree: Tree, packageJsonObj: PackageJson, packageJsonPath = '/package.json') => {
    if (!packageJsonObj.scripts) {
      packageJsonObj.scripts = {};
    }

    packageJsonObj.scripts['update:otter'] = 'ng update @o3r/core';

    tree.overwrite(packageJsonPath, JSON.stringify(packageJsonObj, null, 2));
  };

  return (tree: Tree, context: SchematicContext) => {
    const workspace = getWorkspaceConfig(tree);

    if (!workspace) {
      context.logger.error('No workspace detected');
      return tree;
    }

    if (!projectType) { // at the root of the monorepo
      const rootPackageJsonPath = '/package.json';
      if (tree.exists(rootPackageJsonPath)) {
        const rootPackageJsonObject = tree.readJson(rootPackageJsonPath) as PackageJson;
        ngUpdateScript(tree, rootPackageJsonObject, rootPackageJsonPath);
      }
    }

    Object.entries(workspace.projects)
      .filter(([name]) => !pName || pName === name)
      .forEach(([,workspaceProject]) => {
        const packageJson = readPackageJson(tree, workspaceProject);
        ngUpdateScript(tree, packageJson, `${workspaceProject.root}/package.json`);
      });
    return tree;
  };

}
