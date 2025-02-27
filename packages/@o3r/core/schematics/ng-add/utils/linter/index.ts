import {
  type Tree,
} from '@angular-devkit/schematics';

/**
 * Is the ESLint legacy config used in the repository
 * @param tree
 */
export const isUsingLegacyConfig = (tree: Tree) => {
  const linterPackageName = 'eslint';
  try {
    require.resolve(`${linterPackageName}/package.json`);
  } catch {
    return false;
  }
  return !!tree.root.subfiles.some((file) => /\.eslintrc\.(?:json|js|ya?ml)?$/.test(file));
};
