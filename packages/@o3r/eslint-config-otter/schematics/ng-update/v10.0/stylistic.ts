import {
  posix,
  resolve,
} from 'node:path';
import {
  type Rule,
} from '@angular-devkit/schematics';
import {
  getExternalDependenciesInfo,
  setupDependencies,
} from '@o3r/schematics';
import {
  PackageJson,
} from 'type-fest';

/**
 * Add Stylistic package in the dependencies
 * @param tree
 * @param context
 */
export const addStylistic: Rule = (tree, context) => {
  const projectPackageJson = tree.readJson(posix.join('.', 'package.json')) as PackageJson;
  const externalDependencies = getExternalDependenciesInfo({
    devDependenciesToInstall: ['@stylistic/eslint-plugin-ts'],
    dependenciesToInstall: [],
    o3rPackageJsonPath: resolve(__dirname, '..', '..', '..', 'package.json'),
    projectPackageJson
  }, context.logger
  );
  return setupDependencies({
    dependencies: externalDependencies
  });
};
