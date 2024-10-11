import type {
  JsonObject,
} from '@angular-devkit/core';
import {
  chain,
  type Rule,
} from '@angular-devkit/schematics';

/**
 * Update VSCode recommendations and settings
 */
export const updateVscode: Rule = async () => {
  const { addVsCodeRecommendations } = await import('@o3r/schematics');
  return chain([
    addVsCodeRecommendations(['dbaeumer.vscode-eslint', 'stylelint.vscode-stylelint']),
    (tree) => {
      const vscodeSettingsPath = '.vscode/settings.json';
      const settings = tree.exists(vscodeSettingsPath) ? (tree.readJson(vscodeSettingsPath) || {}) as JsonObject : {};
      settings['eslint.useFlatConfig'] = true;
      settings['editor.defaultFormatter'] = 'dbaeumer.vscode-eslint';
      settings['editor.foldingImportsByDefault'] = true;
      if (tree.exists(vscodeSettingsPath)) {
        tree.overwrite(vscodeSettingsPath, JSON.stringify(settings, null, 2));
      } else {
        tree.create(vscodeSettingsPath, JSON.stringify(settings, null, 2));
      }
      return tree;
    }
  ]);
};
