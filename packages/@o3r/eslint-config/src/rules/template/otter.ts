/* eslint-disable @typescript-eslint/naming-convention */
import type { TSESLint } from '@typescript-eslint/utils';
import o3rBaseConfig from '../base';

export default (
  plugin: TSESLint.FlatConfig.Plugin
): TSESLint.FlatConfig.ConfigArray => [
  o3rBaseConfig(plugin),
  {
    name: '@o3r/template-recommended',
    files: ['**/*.html'],
    rules: {
      '@o3r/template-async-number-limitation': 'warn'
    }
  }
];
