/* eslint-disable @typescript-eslint/naming-convention */
import type { TSESLint } from '@typescript-eslint/utils';
import unicornPlugin from 'eslint-plugin-unicorn';

const config: TSESLint.FlatConfig.ConfigArray = [
  {
    name: '@o3r/overrides/unicorn',
    files: [
      '**/*.{c,m,}{t,j}s'
    ],
    plugins: {
      unicorn: unicornPlugin
    },
    rules: {
      'unicorn/prefer-node-protocol': 'error',
      'unicorn/switch-case-braces': 'warn',
      'unicorn/text-encoding-identifier-case': 'warn'
    }
  }
];

export default config;
