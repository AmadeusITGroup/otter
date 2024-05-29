import type { Tree } from '@angular-devkit/schematics';

/**
 * Determine if the targeted SDK is typescript based
 * @param tree Schematic Tree
 * @param pathInTree Path to the SDK in the tree
 */
export const isTypescriptSdk = (tree: Tree, pathInTree = '/') => {
  return tree.getDir(pathInTree)
    .subfiles
    .some((filePath) => /tsconfig[^/\\]*\.json$/.test(filePath));
};
