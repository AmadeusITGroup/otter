import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { ngAddPackages, readAngularJson, readPackageJson } from '@o3r/schematics';

/**
 * Package.json updates to include o3r ng update script
 * Install of dev-tools and schematics packages
 *
 * @param pName project name
 * @param o3rCoreVersion
 * @param projectType
 */
export function o3rBasicUpdates(pName: string | null, o3rCoreVersion?: string, projectType?: 'application' | 'library'): Rule {

  const updatePackageJson = (tree: Tree, _context: SchematicContext) => {
    const workspace = readAngularJson(tree);

    Object.entries(workspace.projects)
      .filter(([name]) => !pName || pName === name)
      .forEach(([,workspaceProject]) => {
        const packageJson = readPackageJson(tree, workspaceProject);
        if (!packageJson.scripts) {
          packageJson.scripts = {};
        }

        packageJson.scripts['update:otter'] = 'ng update @o3r/core';

        tree.overwrite(`${workspaceProject.root}/package.json`, JSON.stringify(packageJson, null, 2));
      });
    return tree;
  };

  return async (tree: Tree, context: SchematicContext) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { NodeDependencyType } = await import('@schematics/angular/utility/dependencies');

    return () => chain([
      updatePackageJson,
      ngAddPackages(['@o3r/dev-tools', '@o3r/schematics'],
        {skipConfirmation: true, version: o3rCoreVersion, parentPackageInfo: '@o3r/core - basic updates', dependencyType: NodeDependencyType.Dev}),
      ngAddPackages(['@ama-sdk/core'], {
        skipConfirmation: true,
        version: o3rCoreVersion,
        parentPackageInfo: '@o3r/core - basic updates',
        dependencyType: projectType === 'application' ? NodeDependencyType.Default : NodeDependencyType.Peer
      })
    ])(tree, context);
  };
}
