import type {
  Rule,
} from '@angular-devkit/schematics';
import type {
  PackageJson,
} from 'type-fest';

/**
 * Add `vite` as dev dependency to the given package.json files declaring `vitest` without `vite`.
 * Since `vitest@5`, `vite` is only a peer dependency of `vitest` and must be provided by its dependents
 * to be resolvable under strict package managers (such as Yarn PnP).
 * @param packageJsonPaths Paths of the package.json files to update
 * @param viteRange Range of `vite` to add
 */
export function addVitePeerDependency(packageJsonPaths: string[], viteRange: string): Rule {
  return (tree, context) => {
    packageJsonPaths
      .filter((packageJsonPath) => tree.exists(packageJsonPath))
      .forEach((packageJsonPath) => {
        let packageJson: PackageJson;
        try {
          packageJson = tree.readJson(packageJsonPath) as PackageJson;
        } catch {
          context.logger.warn(`Unable to parse ${packageJsonPath}, vite will not be added to its dependencies.`);
          return;
        }
        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
        if (dependencies.vitest && !dependencies.vite) {
          packageJson.devDependencies = { ...packageJson.devDependencies, vite: viteRange };
          tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));
        }
      });
    return tree;
  };
}
