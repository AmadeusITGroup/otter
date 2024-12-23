import type {
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import type {
  PackageJson,
} from 'type-fest';

/**
 * Remove the list of given packages from package.json
 * @param packagesToRemove The list of packages to remove
 * @param packageJsonPath The path of the package json file from which the deps will be removed
 */
export function removePackages(packagesToRemove: string[], packageJsonPath = '/package.json') {
  const filterDeps = (acc: Record<string, string | undefined> = {}, [pName, pVersion]: [string, string | undefined]) => {
    if (!packagesToRemove.includes(pName)) {
      acc[pName] = pVersion;
    }
    return acc;
  };

  return (tree: Tree, _context: SchematicContext) => {
    if (tree.exists(packageJsonPath)) {
      const packageJson: PackageJson = JSON.parse(tree.read(packageJsonPath)!.toString());

      packageJson.dependencies &&= Object.entries(packageJson.dependencies).reduce((acc, dep) => filterDeps(acc, dep), {});
      packageJson.devDependencies &&= Object.entries(packageJson.devDependencies).reduce((acc, dep) => filterDeps(acc, dep), {});
      packageJson.peerDependencies &&= Object.entries(packageJson.peerDependencies).reduce((acc, dep) => filterDeps(acc, dep), {});

      tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }

    return tree;
  };
}
