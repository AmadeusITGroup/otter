import type {
  Rule,
  Tree,
} from '@angular-devkit/schematics';
import {
  createOtterSchematic,
  findFilesInTree,
} from '@o3r/schematics';

const regexp = /DEFAULT_CONFIG\s*:\s*(?:Readonly<)?([A-Z][\w]*)(?:>)?\s*=\s*({[^;]+})\s*(as\s*const)?\s*;/g;

function updateV116Fn(): Rule {
  return (tree: Tree) => {
    const files = findFilesInTree(tree.getDir(''), (filePath) => /config\.ts$/.test(filePath));
    files.forEach(({ content, path }) => {
      const str = content.toString();
      const newContent = str.replaceAll(regexp, 'DEFAULT_CONFIG: Readonly<$1> = $2 as const;');
      if (newContent !== str) {
        tree.overwrite(path, newContent);
      }
    });
  };
}

/**
 * Update of Otter configuration V11.6
 */
export const updateV116 = createOtterSchematic(updateV116Fn);
