import {
  basename,
} from 'node:path';
import type {
  FileEntry,
  Rule,
} from '@angular-devkit/schematics';

/**
 * Update Eslint files to new recommended names
 */
export function updateEslintRecommended(): Rule {
  const configFilePattern = /^.?eslint(:?rc)?\..*/;
  const toReplace = {

    'angular-template-recommended': /(['"](?:plugin:)?@o3r\/)template-recommended(['"])/g,

    'monorepo-recommended': /(['"](?:plugin:)?@o3r\/)json-recommended(['"])/g
  };

  const isFileToParse = (path: string) => configFilePattern.test(basename(path));

  return async (tree) => {
    let files: FileEntry[];
    try {
      const { findFilesInTree } = await import('@o3r/schematics');
      files = findFilesInTree(tree.getDir('/'), isFileToParse);
    } catch {
      files = [];
      tree.visit((path) => isFileToParse(path) && files.push(tree.get(path)!));
    }

    files.forEach(({ content, path }) => {
      const contentStr = content.toString();
      const newContent = Object.entries(toReplace).reduce((acc, [rule, regexp]) => {
        return acc.replaceAll(regexp, `$1${rule}$2`);
      }, contentStr);

      if (contentStr !== newContent) {
        tree.overwrite(path, newContent);
      }
    });
  };
}
