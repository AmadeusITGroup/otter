/* eslint-disable camelcase, @typescript-eslint/naming-convention */
import type { Rule, Tree } from '@angular-devkit/schematics';
import { createSchematicWithMetricsIfInstalled, findFilesInTree } from '@o3r/schematics';

const configObserverRegExp = /\bConfigObserver\b/g;

function updateV10_3Fn(): Rule {
  return (tree: Tree) => {
    const files = findFilesInTree(tree.getDir(''), (filePath) => /.*\.ts/.test(filePath));
    files.forEach(({ content, path }) => {
      const str = content.toString();
      if (configObserverRegExp.test(str)) {
        tree.overwrite(path, str.replaceAll(configObserverRegExp, 'O3rConfig'));
      }
    });
  };
}

/**
 * Update of Otter configuration V10.3
 */
export const updateV10_3 = createSchematicWithMetricsIfInstalled(updateV10_3Fn);
