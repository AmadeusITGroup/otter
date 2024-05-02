import type { Rule, Tree } from '@angular-devkit/schematics';
import {getFilesWithExtensionFromTree} from '@o3r/schematics';

const matchingRegex = /(Configuration)<\s*['"](?:strict|legacy)['"]\s*>/g;

/**
 * Rule to update the configuration declaration
 * As configuration cannot be legacy anymore,
 * we remove the parametrized type of the interface
 * @param tree
 */
export const updateConfiguration: Rule = (tree: Tree) => {
  const files = getFilesWithExtensionFromTree(tree, '.ts');
  files.forEach((file) => {
    const text = tree.readText(file);
    const matches = Array.from(text.matchAll(matchingRegex));
    if (matches.length) {
      tree.overwrite(
        file,
        text.replaceAll(matchingRegex, '$1')
      );
    }
  });
};
