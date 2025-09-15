import {
  chain,
} from '@angular-devkit/schematics';
import type {
  Rule,
} from '@angular-devkit/schematics';
import {
  createOtterSchematic,
  getAllFilesInTree,
} from '@o3r/schematics';

/**
 * Rule to update the Style-dictionary configuration to new scope
 * @param tree
 * @param context
 */
const updateStyleDictionaryConfig: Rule = (tree, context) => {
  const excludes = ['**/node_modules/**', '**/.cache/**'];
  const extensionMatcher = /config\.[mc]?js$/;
  const configFiles = getAllFilesInTree(tree, '/', excludes)
    .filter((filePath) => extensionMatcher.test(filePath));

  configFiles.forEach((file) => {
    const text = tree.readText(file);
    if (text.includes('@o3r/style-dictionary')) {
      context.logger.debug(`Update ${file}`);
      tree.overwrite(file, text.replace(/o3r/g, 'ama'));
    }
  });
};

/**
 * Update of Otter library V13.0
 */
export const updateAll = createOtterSchematic(() => chain([
  updateStyleDictionaryConfig,
  (_, context) => {
    context.logger.warn('The package "@o3r/style-dictionary" is deprecated, please install "@ama-styling/style-dictionary" with the following command:');
    context.logger.warn('ng add @ama-styling/style-dictionary');
  }
]));
