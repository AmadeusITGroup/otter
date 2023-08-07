import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { WorkspaceProject } from '@o3r/schematics';
import { ngAddPackages, readAngularJson, readPackageJson } from '@o3r/schematics';
import type { PackageJson } from 'type-fest';

/**
 * Package.json updates to include o3r ng update script
 * Install of dev-tools and schematics packages
 *
 * @param pName project name
 * @param o3rCoreVersion
 * @param projectType
 */
export function o3rBasicUpdates(pName: string | null | undefined, o3rCoreVersion?: string, projectType?: WorkspaceProject['projectType']): Rule {

  const ngUpdateScript = (tree: Tree, packageJsonObj: PackageJson, packageJsonPath = '/package.json') => {
    if (!packageJsonObj.scripts) {
      packageJsonObj.scripts = {};
    }

    packageJsonObj.scripts['update:otter'] = 'ng update @o3r/core';

    tree.overwrite(packageJsonPath, JSON.stringify(packageJsonObj, null, 2));
  };

  const updatePackageJson = (tree: Tree, _context: SchematicContext) => {
    const workspace = readAngularJson(tree);

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

  return async (tree: Tree, context: SchematicContext) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { NodeDependencyType } = await import('@schematics/angular/utility/dependencies');
    const packagesToAddByProjectType = projectType ? ['@ama-sdk/core'] : ['@ama-sdk/schematics'];
    return () => chain([
      updatePackageJson,
      ngAddPackages(['@o3r/dev-tools', '@o3r/schematics'],
        {skipConfirmation: true, version: o3rCoreVersion, parentPackageInfo: '@o3r/core - basic updates', dependencyType: NodeDependencyType.Dev}),
      ngAddPackages(packagesToAddByProjectType, {
        skipConfirmation: true,
        version: o3rCoreVersion,
        parentPackageInfo: '@o3r/core - basic updates',
        dependencyType: projectType === 'library' ? NodeDependencyType.Peer : NodeDependencyType.Default
      })
    ])(tree, context);
  };
}
