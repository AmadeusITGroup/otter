import { SchematicContext, Tree } from '@angular-devkit/schematics';
import { checkPackagesToInstallOrUpdate } from '@o3r/dev-tools';

/**
 * List peer deps packages of the given package, display a warning if version mismatch, error if peer dep is missing
 *
 * @param packageName The package to check peer deps for
 */
export function checkPackagesRule(packageName: string) {
  return (tree: Tree, _context: SchematicContext) => {
    const angularJson = tree.read('/angular.json');
    checkPackagesToInstallOrUpdate(packageName, angularJson?.toString());
    return tree;
  };
}
