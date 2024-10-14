import type {
  JsonObject,
} from '@angular-devkit/core';
import {
  chain,
  type Rule,
} from '@angular-devkit/schematics';

type ESLintRulesCustomization = {
  rule: string;
  fixable?: boolean;
  severity:
    | 'downgrade'
    | 'error'
    | 'info'
    | 'default'
    | 'upgrade'
    | 'warn'
    | 'off';
};

/* eslint-disable @typescript-eslint/naming-convention -- keys not named by us */
/** @see https://github.com/Microsoft/vscode-eslint?tab=readme-ov-file#settings-options */
type ESLintSettings = {
  'eslint.useFlatConfig'?: boolean;
  'eslint.rules.customizations'?: ESLintRulesCustomization[];
};

type EditorCodeActionsOnSave = {
  'source.fixAll.eslint'?: 'explicit' | 'always' | 'never' | boolean;
};

/** @see https://code.visualstudio.com/docs/getstarted/settings#_default-settings */
type EditorSettings = JsonObject & {
  'editor.defaultFormatter'?: string;
  'editor.foldingImportsByDefault'?: boolean;
  'editor.codeActionsOnSave'?: EditorCodeActionsOnSave;
};
/* eslint-enable @typescript-eslint/naming-convention */

type VScodeSettings = JsonObject & EditorSettings & ESLintSettings;

/**
 * Update VSCode recommendations and settings
 */
export const updateVscode: Rule = async () => {
  const { addVsCodeRecommendations } = await import('@o3r/schematics');
  return chain([
    addVsCodeRecommendations(['dbaeumer.vscode-eslint', 'stylelint.vscode-stylelint']),
    (tree) => {
      const vscodeSettingsPath = '.vscode/settings.json';
      const settings = (tree.exists(vscodeSettingsPath) ? (tree.readJson(vscodeSettingsPath) || {}) : {}) as VScodeSettings;
      settings['eslint.useFlatConfig'] = true;
      settings['editor.defaultFormatter'] = 'dbaeumer.vscode-eslint';
      settings['editor.foldingImportsByDefault'] = true;
      settings['eslint.rules.customizations'] = [
        { rule: '@stylistic/*', fixable: true, severity: 'off' },
        { rule: '!@stylistic/*', fixable: true, severity: 'info' }
      ];
      settings['editor.codeActionsOnSave'] ||= {};
      settings['editor.codeActionsOnSave']['source.fixAll.eslint'] = 'explicit';
      if (tree.exists(vscodeSettingsPath)) {
        tree.overwrite(vscodeSettingsPath, JSON.stringify(settings, null, 2));
      } else {
        tree.create(vscodeSettingsPath, JSON.stringify(settings, null, 2));
      }
      return tree;
    }
  ]);
};
