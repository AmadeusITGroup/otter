import {
  Rule,
  SchematicContext,
  Tree
} from '@angular-devkit/schematics';
import {
  getWorkspaceConfig,
  readPackageJson,
  WorkspaceProject
} from '@o3r/schematics';
import type {
  PackageJson
} from 'type-fest';

const ngUpdateScript = (tree: Tree, packageJsonObj: PackageJson, packageJsonPath = '/package.json') => {
  if (!packageJsonObj.scripts) {
    packageJsonObj.scripts = {};
  }

  packageJsonObj.scripts['update:otter'] = 'ng update @o3r/core';

  tree.overwrite(packageJsonPath, JSON.stringify(packageJsonObj, null, 2));
};

/**
 * Package.json updates to include o3r ng update script
 * @param pName project name
 * @param _o3rCoreVersion
 * @param projectType
 */
export function o3rBasicUpdates(pName: string | null | undefined, _o3rCoreVersion?: string, projectType?: WorkspaceProject['projectType']): Rule {
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
