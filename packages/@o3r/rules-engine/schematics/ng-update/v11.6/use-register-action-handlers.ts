import type {
  Rule,
  Tree,
} from '@angular-devkit/schematics';
import {
  findFilesInTree,
} from '@o3r/schematics';

/**
 * Replace `actionHandlers.add` or `actionHandlers.delete` by `registerActionHandlers` or `unregisterActionHandlers` in file
 * @param tree
 */
export const useRegisterActionHandlers: Rule = (tree: Tree) => {
  const files = findFilesInTree(tree.root, (file) => file.endsWith('.ts'));
  files.forEach(({ content, path }) => {
    if (!/\.actionHandlers\.(add|delete)/.test(content.toString())) {
      return;
    }
    tree.overwrite(
      path,
      content
        .toString()
        .replaceAll(/\.actionHandlers\.add/g, '.registerActionHandlers')
        .replaceAll(/\.actionHandlers\.delete/g, '.unregisterActionHandlers')
    );
  });
  return tree;
};
