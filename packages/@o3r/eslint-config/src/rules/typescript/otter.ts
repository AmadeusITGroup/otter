/* eslint-disable @typescript-eslint/naming-convention */
import type { TSESLint } from '@typescript-eslint/utils';
import o3rBaseConfig from '../base';

export default (
  plugin: TSESLint.FlatConfig.Plugin
): TSESLint.FlatConfig.ConfigArray => [
  o3rBaseConfig(plugin),
  {
    name: '@o3r/typescript',
    // Same files as the ones asked by `typescript-eslint` recommendation
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    rules: {
      '@o3r/matching-configuration-name': 'error',
      '@o3r/no-multiple-type-configuration-property': 'error',
      '@o3r/no-folder-import-for-module': 'error',
      '@o3r/o3r-categories-tags': 'error'
    }
  }
];
