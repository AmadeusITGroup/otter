/* eslint-disable @typescript-eslint/naming-convention */
import type { TSESLint } from '@typescript-eslint/utils';

const config: TSESLint.FlatConfig.ConfigArray = [
  {
    name: '@o3r/overrides/angular-eslint',
    // Same files as the ones asked by `typescript-eslint/eslint-recommended`
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    rules: {
      '@angular-eslint/no-input-rename': 'off',
      '@angular-eslint/directive-class-suffix': 'off',
      '@angular-eslint/no-empty-lifecycle-method': 'off',
      '@angular-eslint/directive-selector': [
        'error',
        {
          'type': 'attribute',
          'style': 'camelCase'
        }
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          'type': 'element',
          'style': 'kebab-case'
        }
      ]
    }
  }
];

export default config;
