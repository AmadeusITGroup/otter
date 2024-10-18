import {
  DirEntry,
  Tree
} from '@angular-devkit/schematics';
import * as minimatch from 'minimatch';

const walkThroughDir = (
  tree: Tree,
  dir: DirEntry,
  filterFunction: (
    element: string,
    indexed: number,
    array: readonly string[]
  ) => boolean,
  parents = ''
): string[] => {
  const folders = dir.subdirs.map((d) => `${parents}/${d}`);
  const matchingFolders = folders.filter(filterFunction);
  return [
    ...dir.subfiles.map((f) => `${parents}/${f}`).filter(filterFunction),
    ...matchingFolders,
    ...folders
      .filter((item) => !(item in matchingFolders))
      .reduce<string[]>(
        (acc, d) =>
          acc.concat(walkThroughDir(tree, tree.getDir(d), filterFunction, d)),
        []
      )
  ];
};

/**
 * Glob function for schematics tree
 * @param tree File tree
 * @param pattern Pattern to match files or folders
 */
export const treeGlob = (tree: Tree, pattern: string) => {
  const filterFunction = minimatch.filter(
    '/' + pattern.replace(/[\\/]+/g, '/'),
    { dot: true }
  );

  return walkThroughDir(tree, tree.root, filterFunction);
};
