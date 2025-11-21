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
 * Rule to update the Stylelint configuration to new scope
 * @param tree
 * @param context
 */
const updateStyleLintConfig: Rule = (tree, context) => {
  const excludes = ['**/node_modules/**', '**/.cache/**'];
  const extensionMatcher = /stylelint.config\.[mc]?js$/;
  const configFiles = getAllFilesInTree(tree, '/', excludes)
    .filter((filePath) => extensionMatcher.test(filePath));

  configFiles.forEach((file) => {
    const text = tree.readText(file);
    if (text.includes('@o3r/stylelint-plugin')) {
      context.logger.debug(`Update ${file}`);
      tree.overwrite(file, text
        .replaceAll(/@o3r\/stylelint-plugin/g, '@ama-styling/stylelint-plugin')
        .replaceAll(/o3r-/g, 'ama-')
      );
    }
  });
};

/**
 * Update of Otter library V13.0
 */
export const updateAll = createOtterSchematic(() => chain([
  updateStyleLintConfig,
  (_, context) => {
    context.logger.warn('The package "@o3r/stylelint-plugin" is deprecated, please install "@ama-styling/stylelint-plugin" with the following command:');
    context.logger.warn('ng add @ama-styling/stylelint-plugin');
  }
]));
