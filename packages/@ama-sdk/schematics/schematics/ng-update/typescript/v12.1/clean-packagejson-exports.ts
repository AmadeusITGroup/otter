import type {
  Rule,
} from '@angular-devkit/schematics';
import {
  findFilesInTree,
} from '@o3r/schematics';
import {
  type PackageJson,
} from 'type-fest';

/**
 * Update the package.json files generated in the Shell of the typescript SDK to support `bundler`
 * @param tree
 */
export const clearPackageJsonExports: Rule = (tree) => {
  const files = findFilesInTree(tree.root, (p) => p.endsWith('package.json'));

  files.forEach((file) => {
    const packageJson = tree.readJson(file.path) as PackageJson;

    packageJson.types = packageJson.types || packageJson.typings;

    delete packageJson.es2020;
    delete packageJson.esm2020;
    delete packageJson.es2015;
    delete packageJson.esm2015;
    delete packageJson.typings;

    if (packageJson.exports) {
      packageJson.exports = Object.fromEntries(
        Object.entries(packageJson.exports)
          .map(([path, map]) => {
            if (typeof map !== 'object' || Array.isArray(map) || map === null) {
              return [path, map];
            }

            if (map.typings) {
              map.types = map.typings;
            }
            if (!map.module) {
              map.module = map.esm2020 || map.esm2015;
            }
            delete map.es2020;
            delete map.esm2020;
            delete map.es2015;
            delete map.esm2015;
            delete map.typings;

            return [path, map];
          })
      );
    }

    tree.overwrite(file.path, JSON.stringify(packageJson, null, 2) + '\n');
  });
  return tree;
};
