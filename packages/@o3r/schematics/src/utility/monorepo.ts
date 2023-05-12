import type { Tree } from '@angular-devkit/schematics';
import * as path from 'node:path';

/**
 * Find the relative path to a configuration file at the monorepo root
 *
 * @param tree
 * @param files List of files to look for, the first of the list will used
 * @param originPath Path from where to calculate the relative path
 * @returns
 */
export function findConfigFileRelativePath(tree: Tree, files: string[], originPath: string) {
  const foundFile = files.find((file) => tree.exists(`/${file}`));
  if (foundFile === undefined) {
    return '';
  }

  return path.posix.relative(originPath, `/${foundFile}`);
}
/**
 * Determine if we are in an Nx Monorepo context
 *
 * @param tree
 */
export function isNxContext(tree: Tree) {
  return tree.exists('/nx.json');
}
